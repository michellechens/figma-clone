import { useCallback } from "react";
import { useMyPresence, useOthers } from "@liveblocks/react";
import LiveCursors from "./cursor/LiveCursors";

const Live = () => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence();

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
    const y = e.clientY - e.currentTarget.getBoundingClientRect().y;
    updateMyPresence({ cursor: { x, y }});
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
    const y = e.clientY - e.currentTarget.getBoundingClientRect().y;
    updateMyPresence({ cursor: { x, y }});
  }, []);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    updateMyPresence({ cursor: null, message: null });
  }, []);

  return (
    <div
      className="h-[100vh] w-full flex justify-center items-center text-center"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <h1 className="text-2xl text-white">Liveblocks Figma Clone</h1>
      <LiveCursors others={others} />
    </div>
  );
}

export default Live;