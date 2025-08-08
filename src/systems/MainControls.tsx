import { FirstPersonControls } from "@react-three/drei";
import { ReactNode } from "react";


function updatePlayerMovement(body, keys) {
    const speed = 5;
    const velocity = new CANNON.Vec3(0, 0, 0);
  
    // 전후 이동
    if (keys.w) velocity.z -= 1;
    if (keys.s) velocity.z += 1;
  
    // 좌우 이동
    if (keys.a) velocity.x -= 1;
    if (keys.d) velocity.x += 1;
  
    // 대각선 이동을 위한 벡터 정규화
    // 키가 2개 이상 눌려 벡터의 길이가 1보다 커지면,
    // speed를 곱하기 전에 벡터의 길이를 1로 만듭니다.
    // 이렇게 해야 대각선 이동 시 속도가 빨라지지 않습니다.
    if (velocity.x !== 0 || velocity.z !== 0) {
      velocity.normalize();
    }
  
    // 최종 속도 적용
    velocity.x *= speed;
    velocity.z *= speed;
    
    // y축 속도는 중력에 의해 조절되므로 기존 값을 유지합니다.
    body.velocity.x = velocity.x;
    body.velocity.z = velocity.z;
  }

export const MainControls = ({ children }: { children?: ReactNode }) => {

    
    return <FirstPersonControls />
}