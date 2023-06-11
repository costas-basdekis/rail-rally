import styles from "@/components/Home.module.scss";
import {About, Tile} from "@/components";

export function Home() {
  return (
    <main className={styles.main}>
      <h1>Rail Rally</h1>
      <svg width={400} height={400}>
        <Tile/>
      </svg>
      <About />
    </main>
  )
}
