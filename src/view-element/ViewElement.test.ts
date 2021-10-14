import { ViewElement } from './ViewElement';

describe('View Element', () => {
  let source: HTMLElement;
  let viewElement: ViewElement;

  beforeEach(() => {
    source = document.createElement('tr');
    source.innerHTML = `
      <td id="900000" tabindex="-1">A. J. Kfoury</td>
      <td id="900001" tabindex="-1">Boston University</td>
      <td id="961360" tabindex="-1">1999</td>
      <td id="961363" tabindex="-1">Machine learning &amp; data mining</td>
      <td id="961365" tabindex="-1">Brown University</td>
      <td id="961368" tabindex="-1">Harvard University</td>
    `;
    viewElement = new ViewElement(source, [(element) => new ViewElement(element)]);
    viewElement.patchWithDOMElement__(source);
  });

  test('unique identifier', () => {
    viewElement.operateOnRange__((viewElement) =>
      viewElement.element_.setAttribute(
        `data-${ViewElement.identifierDatasetName_}`,
        viewElement.identifier_
      )
    );
    const identifiers: Array<string> = viewElement.operateOnRange__(
      (viewElement) => viewElement.identifier_
    );
    expect(identifiers).toHaveLength(6);
    const table = document.createElement('table');
    table.appendChild(source);
    document.body.appendChild(table);
    expect(ViewElement.getElementByIdentifier__(identifiers[0])).toBe(source.children[0]);
  });

  test('Access Properties', () => {
    // no explicit key registered
    expect(Object.keys(viewElement)).toHaveLength(0);
    expect((viewElement as any).children).toHaveLength(6);
    expect(viewElement.children_).toHaveLength(6);
    expect(viewElement.element_).toBe(source);
    expect((viewElement.children_[0] as any).textContent).toBe('A. J. Kfoury');
    expect((viewElement.children_[2] as any).textContent).toBe('1999');
    expect((viewElement.children_[4] as any).id).toBe('961365');
    expect(viewElement instanceof HTMLElement).toEqual(false);
  });

  test('create view element to accommodate DOM child', () => {
    viewElement.removeChildByIndex__(0);
    viewElement.removeChild__(viewElement.children_[0]);
    expect(viewElement.children_).toHaveLength(4);
    expect((viewElement as any).children).toHaveLength(6);
    viewElement.patchWithDOMElement__(source.cloneNode(true) as HTMLElement);
    expect((viewElement as any).children).toHaveLength(6);
    expect(viewElement.children_).toHaveLength(6);
    expect((viewElement.children_[0] as any).textContent).toBe('A. J. Kfoury');
    expect((viewElement.children_[2] as any).textContent).toBe('1999');
    expect((viewElement.children_[4] as any).id).toBe('961365');
  });
});
