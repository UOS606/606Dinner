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

  const TTS_TIME = 0;
  const USER_TIME = 5000;

  const countRef = useRef(0);
  const recognitionActiveRef = useRef(false);
  const userRef = useRef(null);
  let currentStream = null;

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

  // #TODO

  const handleVoice = () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert("이 브라우저는 음성 인식 기능을 지원하지 않습니다.");
      return;
    }

    if (recognitionActiveRef.current) {
      console.log("음성 인식이 이미 활성화되어 있습니다.");
      return;
    }

    const speak = (text, onEndCallback = () => {}) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR"; // 한국어로 음성 출력
      utterance.rate = 1.5;
      utterance.pitch = 2.0;

      utterance.onend = onEndCallback;
      // 오류 발생 시에도 다음 로직 진행
      utterance.onerror = onEndCallback;

      window.speechSynthesis.speak(utterance);
    };

    const startRecordingCycle = () => {
      if (countRef.current >= MAX) {
        console.log("최대 반복 횟수에 도달하여 녹음을 종료합니다.");
        countRef.current = 0;
        return;
      }

      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        currentStream = null;
      }

      recognitionActiveRef.current = true;

      const recordedChunks = []; // 녹음된 데이터 조각을 저장할 배열
      let mediaRecorder;

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          currentStream = stream;
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm; codecs=opus",
          });

          // 데이터 조각이 있을 때마다 배열에 추가
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            recognitionActiveRef.current = false;
            console.log(
              `녹음#${countRef.current}이 종료되었습니다. 파일 전송을 시작합니다.`
            );

            // recordedChunks의 Blob들을 합쳐 하나의 Blob 파일 생성
            const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });

            // 백엔드 전송 함수 호출
            if (isForTest) {
              const testResponseText =
                countRef.current > MAX ? "" : "처리가 완료되었습니다.";
              speak(testResponseText, () => {
                setTimeout(startRecordingCycle, TTS_TIME);
              });
            } else {
              uploadAudioFile(audioBlob)
                .then((response) => {
                  // 백엔드 응답을 기반으로 '그만' 명령이 있었는지 확인
                  const shouldStop = response.stop_command || false;

                  const responseText =
                    response.response_text ||
                    "죄송합니다. 이해하지 못했습니다. 다시 말씀해 주세요.";

                  if (shouldStop) {
                    console.log("백엔드로부터 종료 명령을 받았습니다.");

                    speak(responseText, () => {
                      if (currentStream) {
                        currentStream
                          .getTracks()
                          .forEach((track) => track.stop());
                        currentStream = null;
                      }
                      countRef.current = 0;
                    });
                  } else {
                    speak(responseText, () => {
                      setTimeout(startRecordingCycle, TTS_TIME);
                    });
                  }
                })
                .catch((error) => {
                  console.error("전송/응답 처리 오류:", error);
                  speak(
                    "서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                  );
                  setTimeout(startRecordingCycle, TTS_TIME);
                });
            }
          };

          if (countRef.current === 0) {
            getUserRealName().then(() => {
              const initialGreeting = `안녕하세요, ${
                userRef.current || "고객"
              } 고객님, 어떤 디너를 주문하시겠습니까?`;

              speak();
              // TTS가 끝난 후 녹음 시작
              speak(
                initialGreeting,
                () => {
                  mediaRecorder.start();
                  recognitionActiveRef.current = true;
                  console.log(`녹음 #${countRef.current + 1} 시작...`);
                  countRef.current++;

                  setTimeout(() => {
                    if (mediaRecorder.state !== "inactive") {
                      mediaRecorder.stop();
                    }
                  }, USER_TIME);
                },
                TTS_TIME
              ); // TTS 발화 후 1.5초 딜레이
            });
          } else {
            // 반복 녹음의 경우 바로 시작
            mediaRecorder.start();
            recognitionActiveRef.current = true;
            console.log(`녹음 #${countRef.current + 1} 시작...`);
            countRef.current++;

            // 최소 녹음 시간 설정 (예: 3초)
            setTimeout(() => {
              if (mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
              }
            }, USER_TIME);
          }
        })
        .catch((error) => {
          console.error("마이크 접근 중 오류 발생:", error);
          alert("마이크 접근 권한이 거부되었거나 오류가 발생했습니다.");
          recognitionActiveRef.current = false;
          if (currentStream) {
            currentStream.getTracks().forEach((track) => track.stop());
          }
        });
    };

    startRecordingCycle();
  };

  const uploadAudioFile = (audioBlob) => {
    // FormData를 사용하여 Blob 데이터를 파일 형태로 포장
    const formData = new FormData();
    // 'file'은 백엔드에서 파일을 받을 때 사용할 키 이름입니다.
    formData.append("file", audioBlob, `recording-${Date.now()}.webm`);

    // Fetch API를 사용하여 백엔드로 전송
    fetch("/api/voice-record", {
      // <-- 실제 백엔드 엔드포인트로 변경하세요
      method: "POST",
      // FormData를 사용할 경우, Content-Type 헤더를 명시적으로 설정하지 않아도 됩니다.
      // 브라우저가 자동으로 multipart/form-data와 경계를 설정합니다.
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => console.log("서버 응답:", data))
      .catch((error) => console.error("음성 파일 전송 오류:", error));
  };

  // #TODO

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
