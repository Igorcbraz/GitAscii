import { create } from 'zustand'

export interface DragGhostData {
  widgetId: string
  name: string
  width: number
  height: number
}

interface WidgetDragState {
  isDragging: boolean
  draggingWidget: DragGhostData | null

  startDrag: (widget: DragGhostData) => void
  endDrag: () => void
}

export const useWidgetDragStore = create<WidgetDragState>((set) => ({
  isDragging: false,
  draggingWidget: null,

  startDrag: (widget) =>
    set({
      isDragging: true,
      draggingWidget: widget,
    }),

  endDrag: () =>
    set({
      isDragging: false,
      draggingWidget: null,
    }),
}))
