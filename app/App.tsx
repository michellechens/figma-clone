import * as fabric from "fabric";
import { useEffect, useRef, useState } from "react";
import { useMutation, useStorage } from "@liveblocks/react";
import { handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp, handleCanvasObjectModified, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { handleDelete } from "@/lib/key-events";
import { defaultNavElement } from "@/constants";
import { ActiveElement } from "@/types/type";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Live from "@/components/Live";

const App = () => {
  const isDrawing = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  
  const canvasObjects = useStorage((root) => root.canvasObjects);

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;

    const { objectId } = object;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get('canvasObjects');
    canvasObjects.set(objectId, shapeData);
  }, []);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: '',
    value: '',
    icon: '',
  });

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get('canvasObjects');
    if (!canvasObjects || canvasObjects.size === 0) {
      return true;
    }
    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }
    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({storage}, objectId) => {
    const canvasObjects = storage.get('canvasObjects');
    canvasObjects.delete(objectId);
  }, []);

  const handleActiveElement = (elem: ActiveElement) => {
    switch (elem?.value) {
      case 'reset':
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;
      case 'delete':
        handleDelete(fabricRef.current, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;
      default:
        break;
    }
    setActiveElement(elem);
    selectedShapeRef.current = elem?.value as string;
  };

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
      });
    });
    canvas.on("mouse:move", (options) => {
      handleCanvasMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });
    canvas.on("mouse:up", (options) => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef,
      });
    });
    canvas.on("object:modified", (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    window.addEventListener("resize", () => {
      handleResize({ canvas: fabricRef.current });
    });

    return () => {
      /**
       * dispose is a method provided by Fabric that allows you to dispose the canvas.
       * It clears the canvas and removes all the event listeners.
       *
       * dispose: https://fabricjs.com/api/classes/staticcanvasdommanager/#dispose
       */
      canvas.dispose();

      window.addEventListener("resize", () => {
        handleResize({ canvas: null });
      });
    };
  }, []);

  useEffect(() => {
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef,
    });
  }, [canvasObjects]);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
      />
      <section className="flex h-full flex-row">
        <LeftSidebar />
        <Live canvasRef={canvasRef} />
        <RightSidebar />
      </section>
    </main>
  );
}

export default App;