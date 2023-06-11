"use client";

import styles from './page.module.css'
import {Tile} from "@/components";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Rail Rally</h1>
      <svg width={400} height={400}>
        <Tile />
      </svg>
    </main>
  )
}
