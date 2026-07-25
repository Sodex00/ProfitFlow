import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line } from '@react-three/drei'
import { useRef } from 'react'
import type { Group } from 'three'

const points: [number, number, number][] = [
  [-5,-1.3,0],[-4.3,-.6,0],[-3.6,-.9,0],[-2.8,.15,0],[-2.1,-.2,0],[-1.2,.9,0],[-.4,.55,0],[.3,1.4,0],[1.1,.75,0],[1.8,1.75,0],[2.6,1.45,0],[3.5,2.5,0],[4.3,2.1,0],[5,3.15,0],
]

function MarketLine() {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * .35) * .18
  })
  return <group ref={group}>
    <Line points={points} color="#b8ff4a" lineWidth={4} />
    {points.map((point, index) => index % 3 === 0 && <mesh key={index} position={point}>
      <sphereGeometry args={[.075, 20, 20]} /><meshBasicMaterial color="#d9ff9a" />
    </mesh>)}
  </group>
}

export function Intro({ onDone }: { onDone: () => void }) {
  return <div className="intro" onClick={onDone}>
    <div className="intro-canvas"><Canvas camera={{ position: [0,0,9], fov: 52 }}>
      <fog attach="fog" args={['#050705', 8, 15]} />
      <Float speed={1.8} rotationIntensity={.15} floatIntensity={.35}><MarketLine /></Float>
    </Canvas></div>
    <div className="intro-copy">
      <div className="intro-logo"><span>PF</span></div>
      <h1>Profit<span>Flow</span></h1>
      <p>Синхронизируем рынок с вашей стратегией</p>
      <div className="load-track"><i /></div>
      <small>Нажмите, чтобы продолжить</small>
    </div>
  </div>
}
