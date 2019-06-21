export declare class Bootstrap {
    initCustomers(): Promise<void>;
    addFamily(data: any[], prodmap: any): any[];
    initOrderItems(): Promise<void>;
    initProducts(): Promise<void>;
    initSchemes(): Promise<void>;
    bootstrap(): Promise<void>;
}
export declare const bootstrap: Bootstrap;
