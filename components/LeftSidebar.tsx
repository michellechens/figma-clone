"use client";

import Image from "next/image";
import { useMemo } from "react";
import { LeftSidebarProps } from "@/types/type";
import { getShapeInfo } from "@/lib/utils";

const LeftSidebar = ({ allShapes }: LeftSidebarProps) => {
  // memoize the result of this function so that it doesn't change on every render but only when there are new shapes
  const memoizedShapes = useMemo(() => {
    // console.log('allShapes:', allShapes);
    return (
      <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300
        min-w-[227px] sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20">
        <h3 className="px-5 py-4 text-xs uppercase border-b border-primary-grey-200">Layers</h3>
        <div className="flex flex-col">
          {allShapes?.map((shape) => {
            const [objectId, shapeData] = shape;
            const info = getShapeInfo(shapeData?.type);
            return (
              <div
                key={objectId}
                className="group my-1 flex items-center gap-2 px-5 py-2.5 hover:cursor-pointer hover:bg-primary-green hover:text-primary-black"
              >
                <Image
                  className="group-hover:invert"
                  src={info?.icon}
                  alt="Layer"
                  width={16}
                  height={16}
                />
                <h3 className="text-sm font-semibold capitalize">{info.name}</h3>
              </div>
            );
          })}
        </div>
      </section>
    );
  }, [allShapes?.length]);

  return memoizedShapes;
};

export default LeftSidebar;
