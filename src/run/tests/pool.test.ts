import Pool from '../Pool';

describe('Pool', () => {
  class FakeObj {}
  let builder: jest.Mock<FakeObj>;
  let pool: Pool<FakeObj>;

  beforeEach(() => {
    builder = jest.fn(() => new FakeObj());
    pool = new Pool(builder);
  });

  it('returns a promise that resolves with a new instance', async () => {
    const nextObject = new FakeObj();
    builder.mockImplementationOnce(() => nextObject);
    expect(await pool.get()).toBe(nextObject);
  });

  it('continues to resolve until the specified limit is reached', async () => {
    const objects = [new FakeObj(), new FakeObj(), new FakeObj()];
    pool = new Pool(builder, {limit: objects.length});

    for (const object of objects) {
      builder.mockImplementationOnce(() => object);
      expect(await pool.get()).toBe(object);
    }
  });

  it('resolves with the original object once it is released', async () => {
    const objects = [new FakeObj(), new FakeObj(), new FakeObj()];
    pool = new Pool(builder, {limit: objects.length});

    for (const object of objects) {
      builder.mockImplementationOnce(() => object);
      expect(await pool.get()).toBe(object);
    }

    const nextPromise = pool.get();
    pool.release(objects[1]);
    expect(await nextPromise).toBe(objects[1]);
  });

  it('uses available objects before calling the builder', async () => {
    const lastObject = await pool.get();
    pool.release(lastObject);
    expect(await pool.get()).toBe(lastObject);
  });
});
