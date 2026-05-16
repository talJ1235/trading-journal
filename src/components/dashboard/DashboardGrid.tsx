import { useState, useEffect, useRef, useMemo } from 'react'
import { Responsive } from 'react-grid-layout'
import { WIDGET_REGISTRY, WIDGET_PRIORITY } from './widgetRegistry'
import WidgetWrapper from './WidgetWrapper'
import type { DashboardItem } from './widgetRegistry'

interface Props {
  layout: DashboardItem[]
  isEditing: boolean
  onLayoutChange: (items: DashboardItem[]) => void
  onRemove: (id: string) => void
}

function toRGL(items: DashboardItem[]) {
  return items.map((l) => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h, minW: l.minW, minH: l.minH }))
}

function useContainerWidth(): [number, React.RefObject<HTMLDivElement>] {
  const [width, setWidth] = useState(1200)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.offsetWidth)
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [width, ref]
}

type AnyLayout = { i: string; x: number; y: number; w: number; h: number }

export default function DashboardGrid({ layout, isEditing, onLayoutChange, onRemove }: Props) {
  const [width, containerRef] = useContainerWidth()

  const mobileLayout: DashboardItem[] = useMemo(() => {
    const inLayout = new Set(layout.map((l) => l.i))
    return WIDGET_PRIORITY
      .filter((id) => inLayout.has(id))
      .map((id, idx) => {
        const def = WIDGET_REGISTRY.find((d) => d.id === id)!
        return { i: id, x: 0, y: idx * 4, w: 4, h: def.defaultH, minW: 2, minH: def.minH }
      })
  }, [layout])

  const handleLayoutChange = (currentLayout: AnyLayout[], allLayouts: Record<string, AnyLayout[]>) => {
    const desktop = allLayouts['lg'] ?? allLayouts['md'] ?? currentLayout
    const updated: DashboardItem[] = desktop.map((item) => {
      const existing = layout.find((l) => l.i === item.i)
      return { i: item.i, x: item.x, y: item.y, w: item.w, h: item.h, minW: existing?.minW, minH: existing?.minH }
    })
    onLayoutChange(updated)
  }

  const layouts = {
    lg: toRGL(layout), md: toRGL(layout),
    sm: toRGL(mobileLayout), xs: toRGL(mobileLayout), xxs: toRGL(mobileLayout),
  }

  // Cast to any because @types/react-grid-layout is v1; v2 adds `width` prop to Responsive
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ResponsiveGrid = Responsive as React.ComponentType<any>

  return (
    <div ref={containerRef}>
      <ResponsiveGrid
        width={width}
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 768, sm: 640, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 4, xs: 4, xxs: 4 }}
        rowHeight={80}
        isDraggable={isEditing}
        isResizable={isEditing}
        draggableHandle=".widget-drag-handle"
        onLayoutChange={handleLayoutChange}
        margin={[12, 12]}
        containerPadding={[0, 0]}
      >
        {layout.map((item) => {
          const def = WIDGET_REGISTRY.find((d) => d.id === item.i)
          if (!def) return null
          const Widget = def.component
          return (
            <div key={item.i}>
              <WidgetWrapper id={item.i} name={def.name} icon={def.icon} isEditing={isEditing} onRemove={onRemove}>
                <Widget w={item.w} h={item.h} />
              </WidgetWrapper>
            </div>
          )
        })}
      </ResponsiveGrid>
    </div>
  )
}
