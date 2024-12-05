import { useMemo } from "react";
import { useOthers, useSelf } from "@liveblocks/react";
import { generateRandomName } from "@/lib/utils";
import { Avatar } from "./Avatar";
import styles from "./index.module.css";

const ActiveUsers = () => {
  const MAX_OTHERS = 2;
  const currentUser = useSelf();
  const otherUsers = useOthers();
  const hasMoreUsers = otherUsers.length > MAX_OTHERS;

  const memorizedUsers = useMemo(() => {
    return (
      <div className="flex items-center justify-center gap-1 py-2">
        <div className="flex pl-3">
          {currentUser && (
            <Avatar
              name="You"
              otherStyles="border-[3px] border-primary-green"
            />
          )}
          
          {otherUsers.slice(0, MAX_OTHERS).map(({ connectionId }) => (
            <Avatar
              key={connectionId}
              name={generateRandomName()}
              otherStyles="-ml-3"
            />
          ))}
  
          {hasMoreUsers && <div className={styles.more}>+{otherUsers.length - MAX_OTHERS}</div>}
        </div>
      </div>
    )
  }, [currentUser?.connectionId, otherUsers.length]);

  return memorizedUsers;
}

export default ActiveUsers;