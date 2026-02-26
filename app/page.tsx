import { Game } from '@/components/Game';

export const metadata = {
  title: '2048 - Game',
  description:
    'Play the classic 2048 puzzle game. Combine tiles to reach 2048 and beyond!',
};

export default function Home() {
  return <Game />;
}
