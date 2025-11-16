// src/components/NavBar.jsx
import { useState, useEffect, useRef } from "react";
import styles from "../../styles/NavBar.module.css";
import { Link, useNavigate } from "react-router-dom";

import { isForTest } from "../../App";

const NavBar = ({
  onLoginClick,
  onSignupClick,
  isLoggedIn,
  setIsLoggedIn,
  onRequireLogin,
  username,
  onLogout,
}) => {
  const [couponCount, setCouponCount] = useState(null);
  const navigate = useNavigate();
  const MAX = 15;

  const countRef = useRef(0);
  const recognitionActiveRef = useRef(false);
  const userRef = useRef("");

  useEffect(() => {
    const fetchCouponStatus = async (userId) => {
      if (!userId) return;

      if (isForTest) {
        const testCoupons =
          JSON.parse(localStorage.getItem("test_coupons")) || [];
        const userCoupon = testCoupons.find((c) => c.id === userId);
        setCouponCount(userCoupon ? userCoupon.unusedCouponCount : 0);
      } else {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("/api/coupons", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setCouponCount(data?.unusedCouponCount ?? 0);
        } catch (err) {
          console.error("쿠폰 정보를 불러오지 못했습니다:", err);
          setCouponCount(0);
        }
      }
    };

    fetchCouponStatus(username);
  }, [username]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/");
    onLogout();
    const protectedPaths = ["/order/cart", "/order/history"];
    if (protectedPaths.includes(window.location.pathname)) {
      navigate("/"); // 메인 페이지로 이동
    }
  };

  // 아래부터 음성 인식

  const getUserRealName = async () => {
    if (isForTest) {
      const users = JSON.parse(localStorage.getItem("test_users") || "[]");

      // 사용자의 username과 password를 통해 유저 찾기
      const matchedUser = users.find(
        (u) => u.username === localStorage.getItem("username")
      );

      if (matchedUser) {
        userRef.current = matchedUser.name;
      } else {
        console.error("사용자를 찾을 수 없습니다.");
      }
    } else {
      // 실제 환경에서는 token을 이용해 사용자 정보를 불러오기
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("토큰이 없습니다. 로그인 해주세요.");
        return;
      }

      try {
        const res = await fetch("/api/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Authorization 헤더에 token 전달
          },
        });

        if (res.ok) {
          const data = await res.json();
          userRef.current = data.name;
        } else {
          console.error("사용자 정보를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("서버 오류 발생:", error);
      }
    }
  };

  const handleVoice = () => {
    if (
      !("SpeechRecognition" in window) &&
      !("webkitSpeechRecognition" in window)
    ) {
      alert("이 브라우저는 음성 인식 기능을 지원하지 않습니다.");
      return;
    }

    if (recognitionActiveRef.current) {
      console.log("음성 인식이 이미 활성화되어 있습니다.");
      return;
    }

    if (countRef.current >= MAX) {
      countRef.current = 0;
      console.log("최대 횟수 도달, 카운트 리셋 후 재시작");
    }

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "ko-KR"; // 한국어로 음성 인식
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = true;
    recognition.timeout = 10000;

    const speak = (text) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR"; // 한국어로 음성 출력
      utterance.rate = 1.5;
      utterance.pitch = 2.0;

      // 음성 합성 중 음성 인식 멈추기
      if (recognitionActiveRef.current) {
        recognition.stop();
        recognitionActiveRef.current = false; // Ref 업데이트
      }

      window.speechSynthesis.speak(utterance);
    };

    recognition.onstart = () => {
      console.log("음성 인식이 시작되었습니다...");
      recognitionActiveRef.current = true;
      if (countRef.current === 0) {
        getUserRealName().then(() => {
          // 지역 변수 user 대신 Ref 사용
          speak(
            `안녕하세요, ${
              userRef.current || "고객"
            } 고객님, 어떤 디너를 주문하시겠습니까?`
          );
        });
      }
      countRef.current++;
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      console.log("인식된 텍스트:", transcript);

      /* #TODO AI입갤예정

      const recognitionResult = {
        transcript: transcript,
      };

      fetch("#TODO", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recognitionResult),
      })
        .then((response) => response.json())
        .then((data) => console.log("서버 응답:", data))
        .catch((error) => console.error("전송 오류:", error));

      */
    };

    recognition.onerror = (event) => {
      console.error("음성 인식 중 오류 발생:", event.error);
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;
      if (countRef.current < MAX) {
        recognition.start();
      } else {
        countRef.current = 0; // Ref 업데이트
      }
      console.log("음성 인식이 종료되었습니다.");
    };

    // 음성 합성 시작 시 음성 인식 일시 중지

    // 음성 인식 시작
    if (!recognitionActiveRef.current) {
      recognition.start();
    }
  };

  const handleProtectedClick = (path) => {
    if (!isLoggedIn) {
      onRequireLogin(() => {
        // 로그인 후 원래 이동
        navigate(path);
      });
      return;
    }
    navigate(path); // 이미 로그인된 경우 바로 이동
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img
          src="/images/dinner_606_logo_v3.png"
          alt="606Dinner Logo"
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (username === "admin") navigate("/admin");
            else navigate("/");
          }}
        />
      </div>

      <div className={styles.menu}>
        {username === "admin" ? (
          <>
            <span className={styles.admin}>관리자용 페이지</span>
          </>
        ) : (
          <>
            <Link to="/story">STORY</Link>
            <Link to="/menu">MENU</Link>
            <div className={styles.dropdown}>
              <span className={styles.dropdownToggle}>ORDER</span>
              <div className={styles.dropdownMenu}>
                <button onClick={() => handleProtectedClick("/order/cart")}>
                  장바구니
                </button>
                <button onClick={() => handleProtectedClick("/order/history")}>
                  주문 내역
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.actions}>
        {isLoggedIn ? (
          <>
            {username !== "admin" && (
              <>
                <span className={styles.couponInfo}>
                  {couponCount === null ? (
                    "쿠폰 정보를 불러오는 중..."
                  ) : (
                    <>
                      쿠폰 <strong>{couponCount}</strong>매 보유 중
                    </>
                  )}
                </span>
                <button onClick={handleVoice} className={styles.signupBtn}>
                  음성인식
                </button>
              </>
            )}

            <button onClick={handleLogout} className={styles.loginBtn}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button onClick={onLoginClick} className={styles.loginBtn}>
              로그인
            </button>
            <button className={styles.signupBtn} onClick={onSignupClick}>
              회원가입
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
