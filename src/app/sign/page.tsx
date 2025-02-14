"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { PenToolIcon } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
const DrawingBoard = dynamic(() => import("@/components/drawing-board"), {
  ssr: false,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Signature {
  id: string;
  image_data: string;
  created_at: string;
}

interface Position {
  top: number;
  left: number;
  rotate: number;
  scale: number;
}

function getRandomPosition(): Position {
  return {
    top: Math.random() * 85 + 5, // 5% to 90% of viewport height
    left: Math.random() * 85 + 5, // 5% to 90% of viewport width
    rotate: Math.random() * 20 - 10, // -10 to 10 degrees
    scale: Math.random() * 0.4 + 0.8, // 0.8 to 1.2 scale
  };
}

export default function SignPage() {
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [signatures, setSignatures] = useState<(Signature & Position)[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSignatures = async () => {
    try {
      const { data, error } = await supabase
        .from("signatures")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Add random positions to each signature
      const signaturesWithPositions = (data || []).map((sig) => ({
        ...sig,
        ...getRandomPosition(),
      }));

      setSignatures(signaturesWithPositions);
    } catch (err) {
      console.error("Error loading signatures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignatures();
  }, []);

  const handleSave = async () => {
    setShowDrawingModal(false);
    await loadSignatures();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8F7F2] overflow-hidden select-none p-4 flex flex-col">
      <Nav />
      <div className="flex-grow relative">
        {/* Signatures */}
        {signatures.map((signature) => (
          <div
            key={signature.id}
            className="absolute transition-all duration-300 hover:z-10 hover:scale-110 pointer-events-none"
            style={{
              top: `${signature.top}%`,
              left: `${signature.left}%`,
              transform: `rotate(${signature.rotate}deg) scale(${signature.scale})`,
              maxWidth: "300px",
            }}
          >
            <img
              src={signature.image_data}
              alt="Signature"
              className="max-w-full h-auto select-none"
              style={{ mixBlendMode: "multiply" }}
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        ))}
      </div>

      {/* Add signature button */}
      <button
        onClick={() => setShowDrawingModal(true)}
        className="fixed bottom-16 right-6 w-12 h-12 bg-button-hover text-black rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center pointer-events-auto z-50"
        aria-label="Add signature"
      >
        <PenToolIcon size={22} />
      </button>

      {showDrawingModal && (
        <DrawingBoard
          supabase={supabase}
          onSave={handleSave}
          onClose={() => setShowDrawingModal(false)}
        />
      )}
      <Footer />
    </div>
  );
}
