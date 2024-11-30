import { useCallback, useEffect, useState } from "react";
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@liveblocks/react";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import useInterval from "@/hooks/useInterval";
import LiveCursors from "./cursor/LiveCursors";
import CursorChat from "./cursor/CursorChat";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";

const Live = () => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence();

  const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reactions, setReactions] = useState<Reaction[]>([])

  const broadcast = useBroadcastEvent();

  useInterval(() => {
    setReactions((reactions) => reactions.filter((r) => r.timestamp > Date.now() - 3000));
  }, 1000);

  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      setReactions((prevReactions) => prevReactions.concat([
        {
          point: { x: cursor.x, y: cursor.y },
          value: cursorState.reaction,
          timestamp: Date.now(),
        }
      ]));
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((prevReactions) => prevReactions.concat([
      {
        point: { x: event.x, y: event.y },
        value: event.value,
        timestamp: Date.now(),
      }
    ]));
  });

  // Listen to mouse events to change the cursor state
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
      const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
      const y = e.clientY - e.currentTarget.getBoundingClientRect().y;
      updateMyPresence({ cursor: { x, y }});
    }
  }, []);

  // Hide the cursor when the mouse leaves the canvas
  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, []);

  // Show the cursor when the mouse enters the canvas
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
    const y = e.clientY - e.currentTarget.getBoundingClientRect().y;
    updateMyPresence({ cursor: { x, y }});
    setCursorState((state: CursorState) => 
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: true }
        : state
    );
  }, [cursorState.mode, setCursorState]);

  // Hide the cursor when the mouse is up
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setCursorState((state: CursorState) => 
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: true }
        : state
    );
  }, [cursorState.mode, setCursorState]);

  // Listen to keyboard events to change the cursor state
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          updateMyPresence({ message: '' });
          setCursorState({ mode: CursorMode.Hidden });
          break;
        case '/': // cursor chat
          setCursorState({
            mode: CursorMode.Chat,
            previousMessage: null,
            message: '',
          });
          break;
        case 'e': // emoji reaction
          setCursorState((prevState: CursorState) => 
            prevState.mode !== CursorMode.Chat
              ? { mode: CursorMode.ReactionSelector }
              : prevState
          );
          break;
        default:
          break;
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
      }
    };

    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [updateMyPresence]);


  const setReaction = useCallback((reaction: string) => {
    setCursorState({
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false,
    });
  }, []);

  return (
    <div
      className="h-[100vh] w-full flex justify-center items-center text-center"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <h1 className="text-2xl text-white">Liveblocks Figma Clone</h1>

      {/* Render the reactions */}
      {
        reactions.map((reaction) => (
          <FlyingReaction
            key={reaction.timestamp.toString()}
            x={reaction.point.x}
            y={reaction.point.y}
            timestamp={reaction.timestamp}
            value={reaction.value}
          />
        ))
      }

      {/* Show the live cursors of other users */}
      <LiveCursors others={others} />

      {/* If cursor is in chat mode, show the chat cursor */}
      {
        cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )
      }

      {/* If cursor is in reaction selector mode, show the reaction selector */}
      {
        cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector setReaction={setReaction} />
        )
      }
    </div>
  );
}

export default Live;