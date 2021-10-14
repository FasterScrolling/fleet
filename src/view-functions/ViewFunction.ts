/**
 * @module
 *
 * This module provides a definition (interface) for view function that transforms a source view into a target view, where a view is simply a collection of view elements.
 *
 * These transformations have following properties:
 *
 *    + non-destructive: since the source view for a view function might be used elsewhere, the view function guarantees not to modify the source view.
 *    + efficient: view generation is avoided whenever possible, especially when same source view is provided.
 *    + chainable: see {@link ViewFunctionChain}. The target view of a view function can be passed as source view for another view function. This chaining is still efficient since view generation is avoided when possible at every view function and therefore also for the aggregate view function. This efficiency is greedy in the sense that if a view function in the chain changes while the first source view does not change, the target views before that changed view function are reused while every view function after it will regenerate target view.
 */

import { Collection } from '../collections/Collection';

/**
 * ViewFunction represents a processing unit that transforms a source view to a target view.
 *
 * @type TViewElement: Type for view element, a view is represented as a collection of view elements.
 */
export interface ViewFunction<TViewElement> {
  /**
   * The view transformer function which will consume a `source` view and produces a target view of same type.
   *
   * @param {Collection<TViewElement>} sourceView - An Collection of elements of certain type. Represents the source view. The source view will not be modified.
   * @param {boolean} useCache - Whether previous target view (cache) can be reused when giving same source view and same transformation. If false, the cache should be invalidated.
   * @return {Collection<TViewElement>} The transformed view as an Collection of elements of same type.
   */
  view(sourceView: Collection<TViewElement>, useCache?: boolean): Collection<TViewElement>;
}
