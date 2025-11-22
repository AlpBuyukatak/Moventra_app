"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

type AvatarCanvasProps = {
  hairColor?: string;
  shirtColor?: string;
  pantsColor?: string;
  skinColor?: string;
  hatColor?: string;
  hasHat?: boolean;
};

function VoxelCharacter({
  hairColor = "#facc15",
  shirtColor = "#3b82f6",
  pantsColor = "#111827",
  skinColor = "#f3c9a8",
  hatColor = "#ef4444",
  hasHat = false,
}: AvatarCanvasProps) {
  const group = useRef<THREE.Group>(null!);

  // Hafif idle animasyon
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.5) * 0.25;
      group.current.position.y = Math.sin(t * 1.0) * 0.03;
    }
  });

  return (
    <group ref={group}>
      {/* =================== BAŞ =================== */}
      {/* Baş */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Gözler */}
      <mesh position={[-0.2, 2.2, 0.46]}>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.2, 2.2, 0.46]}>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Saç (üst kapak) */}
      <mesh position={[0, 2.55, 0]}>
        <boxGeometry args={[0.95, 0.35, 0.95]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      {/* Saç (arka taraf) */}
      <mesh position={[0, 2.1, -0.4]}>
        <boxGeometry args={[0.9, 0.8, 0.2]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>

      {/* ŞAPKA (aksesuar) */}
      {hasHat && (
        <>
          {/* Üst kapak */}
          <mesh position={[0, 2.9, 0]}>
            <boxGeometry args={[1.1, 0.25, 1.1]} />
            <meshStandardMaterial color={hatColor} />
          </mesh>
          {/* Siperlik (öne doğru) */}
          <mesh position={[0, 2.7, 0.65]}>
            <boxGeometry args={[0.9, 0.15, 0.4]} />
            <meshStandardMaterial color={hatColor} />
          </mesh>
        </>
      )}

      {/* =================== GÖVDE =================== */}
      {/* Tişört/gövde */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.1, 1.1, 0.6]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Pantolon üst bloğu */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.1, 0.7, 0.6]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>

      {/* =================== BACAKLAR =================== */}
      <mesh position={[-0.3, -0.25, 0]}>
        <boxGeometry args={[0.45, 0.8, 0.55]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      <mesh position={[0.3, -0.25, 0]}>
        <boxGeometry args={[0.45, 0.8, 0.55]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>

      {/* Ayaklar */}
      <mesh position={[-0.3, -0.75, 0.1]}>
        <boxGeometry args={[0.45, 0.2, 0.7]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0.3, -0.75, 0.1]}>
        <boxGeometry args={[0.45, 0.2, 0.7]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* =================== KOLLAR =================== */}
      {/* Gövdeye daha yakın yaptık */}
      <mesh position={[-0.8, 1.35, 0]}>
        <boxGeometry args={[0.4, 0.9, 0.5]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      <mesh position={[0.8, 1.35, 0]}>
        <boxGeometry args={[0.4, 0.9, 0.5]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Eller */}
      <mesh position={[-0.8, 0.75, 0]}>
        <boxGeometry args={[0.4, 0.35, 0.45]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.8, 0.75, 0]}>
        <boxGeometry args={[0.4, 0.35, 0.45]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
    </group>
  );
}

export default function AvatarCanvas(props: AvatarCanvasProps) {
  return (
    <div
      style={{
        width: 220,
        height: 260,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #1f2933",
        background: "radial-gradient(circle at top, #020617, #020617)",
      }}
    >
      <Canvas camera={{ position: [3.2, 3.4, 4.2], fov: 35 }}>
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} />
        <directionalLight position={[-3, 4, -3]} intensity={0.6} />

        <VoxelCharacter {...props} />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          // hedef: gövde hizası, artık bel altı değil
          target={[0, 1.3, 0]}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(Math.PI * 3) / 4}
        />
      </Canvas>
    </div>
  );
}
