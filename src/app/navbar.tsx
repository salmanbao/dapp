import styles from "./navbar.module.css"; // Assuming you're using CSS modules

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.leftSide}>Topup Dapp</div>

        <div className={styles.rightSide}>
          <w3m-button />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
