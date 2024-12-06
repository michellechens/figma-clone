import { useOthers } from "@liveblocks/react";
import { COLORS } from "@/constants";
import Cursor from "./Cursor";

// Display all other live cursors
const LiveCursors = () => {
  const others = useOthers();

  return others.map(({ connectionId, presence }) => {
    if (!presence?.cursor) return null;
    return (
      <Cursor
        key={connectionId}
        color={COLORS[Number(connectionId) % COLORS.length]}
        x={presence.cursor.x}
        y={presence.cursor.y}
        message={presence.message || ''}
      />
    );
  })
};

export default LiveCursors;
