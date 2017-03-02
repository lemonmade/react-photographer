export function lazy<T>(_target: Object, _key: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
  const originalGetter = descriptor.get;
  const cachedValues = new WeakMap<any, T>();

  if (originalGetter == null) {
    throw new Error('You can only use the @lazy decorator for getters.');
  }

  descriptor.get = function get() {
    if (!cachedValues.has(this)) {
      cachedValues.set(this, originalGetter.call(this));
    }

    return cachedValues.get(this) as T;
  }

  return descriptor;
}
