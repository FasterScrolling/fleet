/**
 * @module
 *
 * This module provides a way to represent a collection of element, which provides a way to iterate through a group of elements.
 */

/**
 * Represents an iterable of elements. It provides the following properties:
 *    + indexable with at most O(n) cost
 *    + sliceable with at most O(n) cost
 *
 * *n being the number of elements in the iterable*
 *
 * @typedef {TElement} - The element type.
 */
export interface Collection<TElement> extends Iterable<TElement> {
  /**
   * The length of the collection.
   */
  length: number;
  /**
   * Returns a slice view of the collection with elements selected from start to end (end not included) where `start` and `end` represent the index of items in that array. The collection will not be modified.
   *
   * Roughly equivalent to the following piece of code:
   *
   * ```Javascript
   * for (let i = start; i < end; i++) }
   *    yield collection[i];
   * }
   * ```
   *
   * @param {number} start - Zero-based index at which to start extraction. If `start` is less than 0, 0 will be used as value for `start`.
   * @param {number} end - Zero-based index before which to end extraction. `slice` extracts up to but no including `end`. If end is greater than the length of the collection, `slice` extracts through to the end of the sequence (`collection.length`)
   * @return {Iterable<TElement>} An iterable of elements between specified indices.
   */
  slice(start: number, end: number): Iterable<TElement>;
}

/**
 * An abstract class that provides some static utility functions for `Collection` type and a template for implementing `Collection` type.
 *
 * Note: all optional methods of Collection need to be implemented in derived class.
 *
 * It mandates:
 *
 *    + a way to get the length of the collection
 *    + a way to retrieve an element by index
 *    + a way to iterate the collection
 *    + a way to slice the collection
 */

export abstract class Collection<TElement> implements Collection<TElement> {
  /**
   * Get an element from a collection at specified index. This is the de facto way to retrieve element from collection.
   *
   * + for Array, this will be fallback to `collection[index]`
   * + for other types of collection, this will invoke the `get` method
   *
   * @param collection - A collection of elements.
   * @param index - An index to get element.
   * @return {TElement} The element at specified index. If no element is at specified index, return `undefined`.
   */
  static get<TElement>(collection: Collection<TElement>, index: number): TElement {
    if (Array.isArray(collection)) {
      // use bracket syntax
      return (collection as Array<TElement>)[index];
    } else {
      return collection.get(index);
    }
  }

  /**
   * Whether an element is materialized at a specified index of the collection. An element is materialized when there is O(1) cost to retrieve it using bracket indexing syntax.
   *
   * @param {Collection<TElement>} collection - A collection where the element at specified index is checked.
   * @param {number} index - The element index to check.
   * @returns {boolean} True if the element at specified index is materialized.
   */
  static isElementMaterialized<TElement>(collection: Collection<TElement>, index: number): boolean {
    if ('isElementMaterialized' in collection) {
      return collection.isElementMaterialized(index);
    }

    return index in collection;
  }

  /**
   * Returns the number of elements that can be accessed in constant time.
   *
   * + for Array, this will be fallback to `collection.length`
   * + for other types of collection, this will invoke the `getMaterializationLength` method
   *
   * @param {Collection<TElement>} collection - A collection whose number of constant time accessible element is checked.
   * @returns The number of materialized elements. These elements can be indexed at constant cost.
   */
  static getMaterializationLength<TElement>(collection: Collection<TElement>): number {
    if (Array.isArray(collection)) {
      return collection.length;
    } else {
      return collection.getMaterializationLength();
    }
  }

  /**
   * Normalize the start index and end index used in {@see Collection#slice} call.
   *
   * Start index and end index do not specify a valid range when
   *
   *    + end index is greater than start index
   *    + start index is greater than length
   *
   * @param start - Zero-based index at which to start extraction.
   * @param end - Zero-based index before which to end extraction.
   * @param length - The number of elements in the collection.
   * @returns `null` if start index and end index does not define a valid range. Otherwise, return normalized start index and end index: Both are lower bounded by 0 and upper bounded by collection length (if defined).
   */
  static normalizeSliceIndices(start: number, end: number, length: number): [number, number] {
    // lower bound start index
    start = Math.max(0, start);
    if (end <= start) {
      return null;
    }

    if (length !== undefined) {
      if (start >= length) {
        return null;
      }
      // upper bound end index
      end = Math.min(length, end);
    }

    return [start, end];
  }

  /**
   * This static method provides a basic implementation of `slice` by invoking `Collection.get` on each index in specified range.
   *
   * @see {@link Collection#slice}
   *
   * Returns a slice view of the collection with elements selected from start to end (end not included) where `start` and `end` represent the index of items in that array. The collection will not be modified.
   *
   * Roughly equivalent to the following piece of code:
   *
   * ```Javascript
   * for (let i = start; i < end; i++) }
   *    yield collection[i];
   * }
   * ```
   *
   * @param {number} start - Zero-based index at which to start extraction. If `start` is less than 0, 0 will be used as value for `start`.
   * @param {number} end - Zero-based index before which to end extraction. `slice` extracts up to but no including `end`. If end is greater than the length of the collection, `slice` extracts through to the end of the sequence (`collection.length`)
   * @return {Iterable<TElement>} An iterable of elements between specified indices.
   */
  static *slice<TElement>(
    collection: Collection<TElement>,
    start: number,
    end: number
  ): Iterable<TElement> {
    const normalizedIndices = Collection.normalizeSliceIndices(start, end, collection.length);
    if (normalizedIndices == null) {
      return;
    } else {
      [start, end] = normalizedIndices;
    }

    for (let i = start; i < end; i++) {
      yield Collection.get(collection, i);
    }
  }

  /**
   * Whether the source iterable can be internalized. That is, whether a copy or a partial copy of the source iterable can be stored inside this collection provider.
   */
  materializable?: boolean;

  /**
   * An iterable of collection that constitutes the elements of the collection. The CollectionProvider provides extensions to manipulate this iterable.
   */
  readonly iterable?: Iterable<TElement>;

  /**
   * Creates a CollectionProvider, which is an indexable iterable.
   *
   * @param {Iterable<TElement>} iterable - An iterable of collection that constitutes the elements of the collection. The CollectionProvider provides extensions to manipulate this iterable.
   * @param {MaterializationStrategy} materializationStrategy - Whether and how the collection can materialize the iterable.
   * @constructs AbstractCollectionProvider
   */
  protected constructor(iterable: Iterable<TElement>) {
    this.iterable = iterable;
  }

  /**
   * Implements the iterable protocol.
   *
   * @public
   * @generator
   * @yields {<TElement>} The next element in collection.
   */
  abstract [Symbol.iterator](): IterableIterator<TElement>;

  /**
   * Whether an element is materialized at a specified index. An element is materialized when there is O(1) cost to retrieve it using bracket indexing syntax.
   *
   * @param {number} index - The element index to check.
   * @returns {boolean} True if the element at specified index is materialized.
   */
  abstract isElementMaterialized?(index: number): boolean;

  /**
   * Gets an element at specified index.
   *
   * @param {number} index - An integer at which the element will be retrieved.
   * @return {TElement} The element at specified index. If no element is at specified index, return `undefined`.
   */
  abstract get?(index: number): TElement;

  /**
   * @returns The number of materialized elements. These elements can be indexed at constant cost.
   */
  abstract getMaterializationLength?(): number;

  slice(start: number, end: number): Iterable<TElement> {
    return Collection.slice(this, start, end);
  }
}

/**
 * This interface represents an object containing an element and its index.
 *
 * @typedef {TElement} - The element type.
 */

interface IndexedElement<TElement> {
  /** index of the element */
  index: number;
  /** the element */
  element: TElement;
}

/**
 * An implementation of AbstractCollectionProvider that adopts the `Lazy` MaterializationStrategy. More specifically, this CollectionProvider will materialize the iterable, which means eventually an array containing all elements from the iterable. However, this materialization process happens lazily.
 */

export class LazyCollectionProvider<TElement> extends Collection<TElement> {
  /**
   * Whether materialization process finishes. If the process is finished, `this.materializedCollection` will contain all elements from the iterable in same order.
   */

  protected _materialized: boolean;
  /**
   * Stores the materialized iterable. When materialization is finished, this array will contain all elements from the iterable in correct order. When materialization is not finished, this array will contain a starting subsequence of elements from the iterable. In other words, at any time, this array will contain the first `x` elements from the iterable, where `0 <= x <= n`, n being the length of the iterable.
   */

  protected _materializedCollection: Array<TElement>;

  /**
   * If defined, stores the length of the collection
   */
  protected _length: number;

  get length(): number {
    if (this._length === undefined && this._materialized) {
      return (this._length = this._materializedCollection.length);
    }

    return this._length;
  }

  /**
   * Provide a hint of actual iterable length. Setting the length will not affect the materialization process.
   *
   * @param hint - The length of iterable.
   */
  set length(hint: number) {
    this._length = hint;
  }

  /** stores the iteration context (last iteration continuation) */
  protected _continuation: Generator<IndexedElement<TElement>, any, number>;

  /**
   * A continuation (represented by a generator) that records last iteration progress. From a different perspective, it is a generator that can yield all elements that have not been iterated yet.
   */
  protected get continuation(): Generator<IndexedElement<TElement>, any, number> {
    if (!this._continuation) {
      const that = this;
      this._continuation = (function* () {
        let index = 0;
        for (const element of that.iterable) {
          that.materializeElement(index, element);
          yield { index, element };
          index++;
        }

        that._length = index;
        that._materialized = true;
      })();
    }
    return this._continuation;
  }

  /**
   * Invokes `AbstractCollectionProvider#constructor` with `Lazy` MaterializationStrategy.
   *
   * @param {Iterable<TElement>} iterable - An iterable of collection elements. This iterable could be single-use since it will be materialized.
   */
  constructor(iterable: Iterable<TElement>) {
    super(iterable);

    this._materializedCollection = [];
    this._materialized = false;
  }

  /**
   * Materializes an element at specified index. In current implementation, it will store the element at that index in the internal array.
   *
   * @param {number} index - Element index in the iterable.
   * @param {TElement} element - The element to be materialized.
   */
  protected materializeElement(index: number, element: TElement): void {
    this._materializedCollection[index] = element;
  }

  isElementMaterialized(index: number): boolean {
    return this._materialized || index in this._materializedCollection;
  }

  *[Symbol.iterator](): IterableIterator<TElement> {
    if (this._materialized) {
      // reuse the materialized collection
      yield* this._materializedCollection;
    } else {
      // iterate using the continuation
      const continuation = this.continuation;
      let iterIndex = 0;
      while (true) {
        const { done, value } = continuation.next();
        if (done) {
          break;
        }
        for (; iterIndex <= value.index; iterIndex++) {
          yield this._materializedCollection[iterIndex];
        }
      }
    }
  }

  get(index: number): TElement {
    if (this.isElementMaterialized(index)) {
      return this._materializedCollection[index];
    }

    const length = this.length;
    if (index < 0 || (length !== undefined && index >= length)) {
      // shortcut out of bound indexing
      return undefined;
    }

    const continuation = this.continuation;
    while (true) {
      const { done, value } = continuation.next();
      if (done) {
        return undefined;
      }

      const { index: elementIndex, element } = value;
      if (index < elementIndex) {
        return this._materializedCollection[index];
      } else if (index === elementIndex) {
        return element;
      }
    }
  }

  getMaterializationLength(): number {
    return this._materializedCollection.length;
  }

  *slice(start: number, end: number): IterableIterator<TElement> {
    const normalizedIndices = Collection.normalizeSliceIndices(start, end, this.length);
    if (normalizedIndices == null) {
      return;
    } else {
      [start, end] = normalizedIndices;
    }

    if (this._materialized || end in this._materializedCollection) {
      // if end in materialized, then all indices before it is also materialized
      for (let i = start; i < end; i++) {
        yield this._materializedCollection[i];
      }
    }

    const continuation = this.continuation;
    let iterIndex = 0;
    while (true) {
      const { done, value } = continuation.next();
      if (done) {
        return;
      }

      for (; iterIndex <= value.index; iterIndex++) {
        if (start <= iterIndex) {
          if (iterIndex < end) {
            yield this._materializedCollection[iterIndex];
          } else {
            return;
          }
        }
      }
    }
  }
}
