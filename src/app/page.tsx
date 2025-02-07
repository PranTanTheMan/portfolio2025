"use client";
import { TextAnimate } from "@/components/magicui/text-animate";
import { useEffect, useState } from "react";
import Link from "@/components/link";

export default function Home() {
  const greetings = [
    "Hey, I'm", // English
    "Hola, soy", // Spanish
    "Bonjour, je suis", // French
    "こんにちは、私は", // Japanese
    "你好，我是", // Chinese
    "Namaste, main", // Hindi
    "Hallo, ich bin", // German
    "안녕하세요, 저는", // Korean
    "Привет, я", // Russian
    "Merhaba, ben", // Turkish
    "Γεια σας, είμαι", // Greek
    "مرحبا انا", // Arabic
    "Hej, jag är", // Swedish
    "Xin chào, tôi là", // Vietnamese
    "สวัสดี ฉันคือ", // Thai
    "Salam, mən", // Azerbaijani
  ];

  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl tracking-wider flex gap-2">
            <TextAnimate
              key={currentGreetingIndex}
              animation="blurInUp"
              by="character"
            >
              {greetings[currentGreetingIndex]}
            </TextAnimate>
          </h1>
          <h1 className="text-3xl tracking-wider flex gap-2">
            Pranith Molakalapalli 👋
          </h1>
          <p className="text-base mt-4 font-mono tracking-wide">
            i like{" "}
            <Link className="font-mono" href="https://venmo.com/u/Prani28">
              money
            </Link>
            . i like to code. i like{" "}
            <Link
              className="font-mono"
              href="https://www.youtube.com/watch?v=zdmNssjcOLw"
            >
              food
            </Link>
            .
          </p>
        </div>
        <div className="flex mt-10 flex-col gap-2">
          <h1 className="text-3xl tracking-wider flex gap-2">
            i dabble in a few things.
          </h1>
          <p className="text-base mt-4 font-mono tracking-wide leading-loose">
            i am a software engineer and a entrepreneur from minneapolis,
            minnesota. currently a undergrad student at{" "}
            <Link className="font-mono" href="https://asu.edu">
              ASU
            </Link>{" "}
            studying data science. i'm also building{" "}
            <Link className="font-mono" href="https://learneffinity.com">
              Effinity
            </Link>{" "}
            and a few other things.
          </p>
        </div>
      </div>
    </>
  );
}
