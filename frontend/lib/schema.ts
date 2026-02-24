export type ComponentType = 'text' | 'metric' | 'card' | 'list' | 'chart';

export interface BaseComponent {
    id: string;
    type: ComponentType;
    order: number; // For sequential tunnel rendering
    w?: number; // width
    h?: number; // height
}

export interface TextComponent extends BaseComponent {
    type: 'text';
    content: string;
    style?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
    color?: string;
}

export interface MetricComponent extends BaseComponent {
    type: 'metric';
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export interface CardComponent extends BaseComponent {
    type: 'card';
    title: string;
    content: string;
    items?: UIComponent[]; // nested components
}

export interface ListComponent extends BaseComponent {
    type: 'list';
    title?: string;
    items: string[];
}

export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface ChartComponent extends BaseComponent {
    type: 'chart';
    title?: string;
    chartType?: 'bar' | 'radial' | 'line';
    data: ChartDataPoint[];
    unit?: string;
}

export type UIComponent = TextComponent | MetricComponent | CardComponent | ListComponent | ChartComponent;

export interface UICanvasState {
    components: UIComponent[];
    canvasId: string;
}
