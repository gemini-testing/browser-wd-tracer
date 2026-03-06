type Listener = () => void;

export type WithId<T> = T & { _id: number };

export interface ObservableList<TInput, TItem> {
  getItems: () => WithId<TItem>[];
  getVersion: () => number;
  subscribe: (cb: Listener) => () => void;
  addBatch: (inputs: TInput[]) => void;
  reset: () => void;
}

export interface ObservableListOptions<TInput, TItem> {
  createTransform: () => (inputs: TInput[]) => TItem[];
}

export function createObservableList<TInput, TItem>(
  options: ObservableListOptions<TInput, TItem>,
): ObservableList<TInput, TItem> {
  const { createTransform } = options;

  let transform = createTransform();
  let items: WithId<TItem>[] = [];
  let nextId = 0;
  let version = 0;

  const listeners = new Set<Listener>();

  function notify(): void {
    version++;
    listeners.forEach((cb) => cb());
  }

  return {
    getItems: () => items,
    getVersion: () => version,

    subscribe(cb: Listener): () => void {
      listeners.add(cb);

      return () => listeners.delete(cb);
    },

    addBatch(inputs: TInput[]): void {
      const newItems = transform(inputs);

      if (newItems.length === 0) {
        return;
      }

      for (const item of newItems) {
        items.push({ ...item, _id: nextId++ });
      }

      notify();
    },

    reset(): void {
      items = [];
      nextId = 0;
      transform = createTransform();
      notify();
    },
  };
}
