/**
 * @module
 *
 * This module provides an Abstraction class which encapsulates a set of properties.
 *
 * These properties, like regular properties defined on an object, can be accessed and modified using regular dot syntax or bracket syntax. However, their access/modification is channeled through property descriptor (more specifically, access descriptors which are getter and setter functions) {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor}, which can facilitate advanced mechanisms like proxy or aliasing.
 * Read {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get getter} and {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set setter} for inspiration.
 */

import { NotImplemented } from '../utils/errors';

/**
 * The key name of a property.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty}
 */
export type Prop = string | number | symbol;

/**
 * An abstraction groups together a set of properties.
 *
 * These core functionalities are exposed by the Abstraction class:
 *
 *    + @public {@link Abstraction#registerProps__} registering/revoking properties
 *
 * These functionalities can be overridden:
 *    + @protected {@link Abstraction.__createDescriptor} create a descriptor for a property given part of a complete property descriptor (usually just the getter and setter)
 *
 * Its subclasses should follow these naming conventions:
 *
 *    + registered properties should be intact (unmodified) and can be accessed directly
 *      @example Suppose `foo` is a registered property, it should be accessible from `this.foo`
 *    + implementation-specific variable will be preceded by one underscores if it is private, otherwise, it will be suffixed by one underscore
 *    + implementation-specific method (except methods like constructor or Symbol.iterator required by class) will be preceded by two underscores if it is private, otherwise, it will be suffixed by two underscores
 */
export abstract class Abstraction {
  /**
   * Creates an Abstraction instance.
   *
   * @param {Record<Prop, Partial<PropertyDescriptor>} props - An object containing mapping from properties to their descriptors.
   * @constructs Abstraction
   *
   * @example
   *    If you want to create an Abstraction and add properties later, you can invoke constructor with `{}`: `new Abstraction({});`
   */
  constructor(props: Record<Prop, Partial<PropertyDescriptor>>) {
    this.registerProps__(props);
  }

  /**
   * Creates a default descriptor that
   *
   *    + is configurable (so that it can be replaced or revoked in {@link Abstraction#registerProps__}
   *    + is enumerable
   *    + will report NotImplemented error when uses [[Get]] or [[Set]] to access the property
   *
   * @param {Prop} property - Name of property.
   * @return {PropertyDescriptor} A descriptor that can be used as argument in {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty Object.defineProperty()}.
   * @throws {NotImplemented} When getter or setter is not provided but access/modification is performed.
   */
  private static __defaultDescriptor(property: Prop): PropertyDescriptor {
    return {
      configurable: true,
      enumerable: true,
      get(): any {
        throw new NotImplemented(`Getter for ${property.toString()} has not been implemented`);
      },
      set(newValue: any) {
        throw new NotImplemented(
          `Setter for ${property.toString()} has not been implemented: received ${
            newValue as string
          }`
        );
      },
    };
  }

  /**
   * Create a descriptor by overriding default descriptor in {@link Abstraction.__defaultDescriptor}.
   *
   * Notes:
   *
   *    + Passing null / undefined to descriptor will result in a clone of default descriptor
   *
   * @param {Prop} property - Name of property.
   * @param {Partial<PropertyDescriptor>} descriptor - An object containing overrides to default descriptor.
   * @return {PropertyDescriptor} A descriptor that can be used as argument in {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty Object.defineProperty()}.
   */
  private static __createDescriptor(
    property: Prop,
    descriptor: Partial<PropertyDescriptor>
  ): PropertyDescriptor {
    return Object.assign({}, this.__defaultDescriptor(property), descriptor);
  }

  /**
   * Registers properties on current instance.
   *
   * @param {Record<Prop, Partial<PropertyDescriptor>>} props - An object whose keys represent the names of properties to be defined or modified and whose values are objects describing those properties. Each value in props must provide a descriptor or contain overrides to default descriptor.
   */
  private __setPropertyDescriptors(props: Record<Prop, Partial<PropertyDescriptor>>) {
    /**
     * `in` operator is used for speed (avoid unnecessary array allocation in `Object.entries`
     * `hasOwnProperty` is skipped as `props` is assumed to be a simple object (no lookup through prototype chain)
     */

    for (const property in props) {
      const descriptor = props[property];
      Object.defineProperty(this, property, Abstraction.__createDescriptor(property, descriptor));
    }
  }

  /**
   * Registers properties into current abstraction.
   *
   * All registered properties will have *proxied* access in that even though they are bound to the current instance and can be accessed using the dot syntax, their access and modification are regulated by {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty access descriptor}.
   *
   * You can think PropertyDescriptor as a Proxy that defines how access and modification to an attribute is eventually resolved. And the Abstraction has these props as pseudo-properties whose access/modification are proxied.
   *
   * This method can be used to
   *
   *    + register properties to a fresh new instance
   *    + add properties to a instance with existing properties registered
   *    + remove all existing registered properties from an instance
   *    + replace all existing registered properties with new properties
   *
   * @example
   * Suppose `foo` is registered as a prop whose access descriptor is a function that always return `"foo"`. Then accessing `foo` using `this.foo` will invoke this descriptor and return `"foo"`.
   *
   * @public
   * @param {Record<Prop, Partial<PropertyDescriptor>>} props - An object contains mapping from Prop to PropertyDescriptor.
   */
  registerProps__(props: Record<Prop, Partial<PropertyDescriptor>>): void {
    this.__setPropertyDescriptors(props);
  }

  /**
   * Checks whether a name satisfy the naming rule for `Abstraction` and its deriving class:
   *
   *    To differentiate from normal property names, property name in `Abstraction` and its deriving class should start or end with underscore.
   *
   * @public
   * @param {string} name - A name to be checked for compliance.
   * @returns {boolean} Whether the name satisfies the naming rule.
   */
  static satisfyNamingRule__(name: string): boolean {
    return name.startsWith('_') || name.endsWith('_');
  }
}
