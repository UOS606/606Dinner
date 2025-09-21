import styles from "../App.module.css"; // 혹은 별도 Home.module.css

const images = ["/images/homepage1.png", "/images/homepage2.png"];

function Home() {
  return (
    <div className={styles.homeBanner}>
      {images.map((src, idx) => (
        <img key={idx} src={src} alt={`Homepage ${idx}`} />
      ))}
    </div>
  );
}

export default Home;
