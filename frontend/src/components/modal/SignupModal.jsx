import React, { useState } from "react";
import styles from "./SignupModal.module.css";

const SignupModal = ({ onClose, onShowLogin }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    city: "",
    district: "",
    neighborhood: "",
    houseNumber: "",
    cardNumber: "",
    password: "",
    confirm: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "cardNumber") {
      // 숫자만 남기기
      let digits = value.replace(/\D/g, "");
      digits = digits.slice(0, 16);
      // 4자리마다 - 추가
      const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1-");
      setForm((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      alert("비밀번호가 서로 일치하지 않습니다.");
      return;
    }
    if (!form.terms) {
      alert("이용약관에 동의해 주세요.");
      return;
    }
    if (!/^\d{16}$/.test(form.cardNumber.replaceAll("-", ""))) {
      alert("신용카드 번호를 16자리 숫자로 입력해 주세요.");
      return;
    }

    // 주소 합치기
    const fullAddress = `${form.city} ${form.district} ${form.neighborhood} ${form.houseNumber}`;

    try {
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          username: form.username,
          phone: form.phone,
          address: fullAddress,
          cardNumber: form.cardNumber.replaceAll("-", ""),
          password: form.password,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "회원가입 실패. 다시 시도해 주세요.");
        return;
      }

      alert("회원가입 성공! 로그인 해주세요.");
      onClose();
      onShowLogin();
    } catch (error) {
      console.error(error);
      alert("네트워크 오류가 발생했습니다. 서버 상태를 확인해 주세요.");
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.modal}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
          type="button"
        >
          ×
        </button>

        <div className={styles.logo}>
          <img src="/images/dinner_606_logo_v3.png" alt="606Dinner Logo" />
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.grid}>
            {/* 이름 */}
            <div className={styles.inputGroup}>
              <label htmlFor="name">
                이름<span className={styles.req}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={30}
                placeholder="홍길동"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {/* 이메일 */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">
                이메일<span className={styles.req}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="user@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {/* 아이디 */}
            <div className={styles.inputGroup}>
              <label htmlFor="username">
                아이디<span className={styles.req}>*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={4}
                maxLength={20}
                pattern="[A-Za-z0-9]+"
                placeholder="영문/숫자 4~20자"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            {/* 연락처 */}
            <div className={styles.inputGroup}>
              <label htmlFor="phone">
                연락처<span className={styles.req}>*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="010-1234-5678"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            {/* 주소 4칸 */}
            <div className={styles.inputGroup}>
              <label>
                주소<span className={styles.req}>*</span>
              </label>
              <div className={styles.addressGroup}>
                <input
                  name="city"
                  placeholder="시/도"
                  value={form.city}
                  onChange={handleChange}
                />
                <input
                  name="district"
                  placeholder="구/군/구"
                  value={form.district}
                  onChange={handleChange}
                />
                <input
                  name="neighborhood"
                  placeholder="읍/면/동"
                  value={form.neighborhood}
                  onChange={handleChange}
                />
                <input
                  name="houseNumber"
                  placeholder="상세주소"
                  value={form.houseNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 신용카드 */}
            <div className={`${styles.inputGroup} ${styles.full}`}>
              <label htmlFor="cardNumber">
                신용카드 번호<span className={styles.req}>*</span>
              </label>
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                inputMode="numeric"
                pattern="\d*"
                placeholder="1234-5678-9012-3456"
                required
                maxLength={19}
                value={form.cardNumber}
                onChange={handleChange}
              />
              <small className={styles.hint}>숫자만 입력하세요 (16자리)</small>
            </div>

            {/* 비밀번호 */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">
                비밀번호<span className={styles.req}>*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="최소 8자"
                value={form.password}
                onChange={handleChange}
              />
              <small className={styles.hint}>
                영문 대/소문자, 숫자, 특수문자 조합 권장
              </small>
            </div>

            {/* 비밀번호 확인 */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirm">
                비밀번호 확인<span className={styles.req}>*</span>
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={8}
                placeholder="비밀번호 재입력"
                value={form.confirm}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 이용약관 동의 */}
          <div className={styles.checkbox}>
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={form.terms}
              onChange={handleChange}
              required
            />
            <label htmlFor="terms">
              이용약관 및 개인정보 처리방침에 동의합니다.
            </label>
          </div>

          {/* 제출 버튼 */}
          <button type="submit" className={styles.signupBtn}>
            회원가입
          </button>

          {/* 로그인 링크 */}
          <div className={styles.extraLinks}>
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => {
                onClose();
                onShowLogin();
              }}
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignupModal;
