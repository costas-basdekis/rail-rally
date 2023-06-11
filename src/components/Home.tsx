import styles from "@/components/Home.module.css";
import {Tile} from "./Tile";

export function Home() {
  return (
    <main className={styles.main}>
      <h1>Rail Rally</h1>
      <svg width={400} height={400}>
        <Tile/>
      </svg>
    </main>
  )
}
