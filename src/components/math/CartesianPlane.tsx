/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import 'jsxgraph/distrib/jsxgraph.css';
import { Maximize2, Minus, Plus } from 'lucide-react';
import { useI18n } from '../../i18n';

export type BoundingBox = [number, number, number, number];

export interface PlaneContext {
  JXG: any;
  board: any;
}

interface CartesianPlaneProps {
  ariaLabel: string;
  /** [xmin, ymax, xmax, ymin] in user coordinates. */
  boundingBox?: BoundingBox;
  showGrid: boolean;
  /** Called once after the board exists; may return a cleanup. Must be referentially stable in meaning. */
  onReady: (ctx: PlaneContext) => void | (() => void);
  /** Increment to restore the initial view. */
  resetSignal?: number;
  accent?: string;
  small?: boolean;
}

const DEFAULT_BB: BoundingBox = [-10, 10, 10, -10];

/**
 * JSXGraph cartesian plane with equal axis scale, zoom/pan and a grid toggle.
 * The board is created once (lazily, JSXGraph is loaded on demand) and destroyed on unmount.
 */
export function CartesianPlane({ ariaLabel, boundingBox = DEFAULT_BB, showGrid, onReady, resetSignal = 0, accent, small }: CartesianPlaneProps) {
  const { t } = useI18n();
  const hostRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<any>(null);
  const bbRef = useRef(boundingBox);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const gridRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cleanup: void | (() => void);
    let board: any = null;
    let JXG: any = null;
    import('jsxgraph').then((mod) => {
      if (cancelled || !hostRef.current) return;
      JXG = mod.default;
      board = JXG.JSXGraph.initBoard(hostRef.current, {
        boundingbox: bbRef.current,
        keepAspectRatio: true,
        axis: true,
        grid: false,
        showCopyright: false,
        showNavigation: false,
        showInfobox: false,
        pan: { enabled: true, needTwoFingers: true },
        zoom: { wheel: true, needShift: true, factorX: 1.2, factorY: 1.2, min: 0.15, max: 15 },
        resize: { enabled: true, throttle: 40 },
        keyboard: { enabled: true, dx: 20, dy: 20 },
        defaultAxes: {
          x: {
            name: 'x',
            withLabel: true,
            strokeColor: '#334155',
            strokeWidth: 1.5,
            label: { position: 'rt', offset: [-14, 12], fontSize: 14, strokeColor: '#334155' },
            ticks: { drawZero: false, label: { fontSize: 11, strokeColor: '#475569' }, strokeColor: '#94A3B8' },
          },
          y: {
            name: 'y',
            withLabel: true,
            strokeColor: '#334155',
            strokeWidth: 1.5,
            label: { position: 'rt', offset: [12, -14], fontSize: 14, strokeColor: '#334155' },
            ticks: { drawZero: false, label: { fontSize: 11, strokeColor: '#475569' }, strokeColor: '#94A3B8' },
          },
        },
      });
      boardRef.current = board;
      cleanup = onReadyRef.current({ JXG, board });
      board.update();
      setReady(true);
    });
    return () => {
      cancelled = true;
      try {
        if (cleanup) cleanup();
      } catch {
        /* ignore cleanup errors */
      }
      if (board && JXG) {
        // Stop observers first: a pending throttled resize would otherwise hit a freed board.
        try {
          board.stopResizeObserver?.();
          board.updateContainerDims = () => board; // a resize timeout may already be queued
          board.removeEventHandlers?.();
        } catch {
          /* ignore */
        }
        JXG.JSXGraph.freeBoard(board);
      }
      boardRef.current = null;
      gridRef.current = null;
      setReady(false);
    };
  }, []);

  // Grid on/off without rebuilding the board.
  useEffect(() => {
    const board = boardRef.current;
    if (!board || !ready) return;
    board.removeGrids();
    gridRef.current = null;
    if (showGrid) {
      gridRef.current = board.create('grid', [], { strokeColor: '#CBD5E1', strokeOpacity: 0.9, strokeWidth: 1, majorStep: 1 });
    }
    board.update();
  }, [showGrid, ready]);

  // Reset view on demand.
  useEffect(() => {
    const board = boardRef.current;
    if (!board || !ready || resetSignal === 0) return;
    board.setBoundingBox(bbRef.current, true);
    board.update();
  }, [resetSignal, ready]);

  const zoom = (dir: 'in' | 'out' | 'reset') => {
    const board = boardRef.current;
    if (!board) return;
    if (dir === 'in') board.zoomIn();
    else if (dir === 'out') board.zoomOut();
    else board.setBoundingBox(bbRef.current, true);
  };

  return (
    <div className={`plane${small ? ' plane--small' : ''}`} style={accent ? ({ ['--accent' as string]: accent } as React.CSSProperties) : undefined}>
      <div className="plane__board-wrap">
        <div ref={hostRef} className="plane__board jxgbox" role="group" aria-label={ariaLabel} />
        {!ready && <div className="plane__loading" aria-live="polite">{t('ui.loadingGraph')}</div>}
      </div>
      <div className="plane__tools" role="toolbar" aria-label={t('ui.graphTools')}>
        <button type="button" className="icon-btn" onClick={() => zoom('in')} aria-label={t('ui.zoomIn')} title={t('ui.zoomIn')}>
          <Plus size={18} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" onClick={() => zoom('out')} aria-label={t('ui.zoomOut')} title={t('ui.zoomOut')}>
          <Minus size={18} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" onClick={() => zoom('reset')} aria-label={t('ui.resetView')} title={t('ui.resetView')}>
          <Maximize2 size={16} aria-hidden="true" />
        </button>
        <span className="plane__hint">{t('ui.planeHint')}</span>
      </div>
    </div>
  );
}
