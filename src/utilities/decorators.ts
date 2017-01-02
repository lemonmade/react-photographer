export function lazy<T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
  const originalGetter = descriptor.get;
  const cachedValues = new WeakMap<any, T>();

  descriptor.get = function get() {
    if (!cachedValues.has(this)) {
      cachedValues.set(this, originalGetter.call(this));
    }

    return cachedValues.get(this);
  }

  return descriptor;
}
