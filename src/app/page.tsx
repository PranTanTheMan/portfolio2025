"use client";
import Button from "@/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    }, 3000); // Change greeting every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="max-w-md lg:max-w-2xl mx-auto mt-12 border-2 border-gray-300">
        <nav className="flex justify-between mb-20">
          <div className="flex justify-between w-full items-center gap-2">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/Pranith.webp" alt="@Pranith" />
              <AvatarFallback>PM</AvatarFallback>
            </Avatar>
            <div className="font-normal flex gap-2 tracking-wider">
              <Button>{"[P] PROJECTS"}</Button>
              <Button>{"[D] DATA"}</Button>
              <Button>{"[R] RESUME"}</Button>
            </div>
          </div>
        </nav>
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
            <p className="text-base mt-8 font-mono tracking-wide">
              i like{" "}
              <Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
                money
              </Link>
              . i like to code. i like{" "}
              <Link href="https://www.youtube.com/watch?v=zdmNssjcOLw">
                food
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
