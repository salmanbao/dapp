"use client";
import styles from "./page.module.css";
import Menu from "./card";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <Menu />
      </div>
    </main>
  );
}
