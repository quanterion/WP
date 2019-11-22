/** Элемент сметы изделия */
interface PriceElement {
  /** имя */
  name: string;
  enabled: boolean;
  modelId?: number;
  materialId?: number;
  catalogId?: number;
  /** артикул */
  sku?: string;
  /** цена */
  price?: number;
  cost: number;
  /** название единицы измерения */
  unitName: string;
  /** описание */
  description?: string;
  /** список объектов в проекте */
  entities: any[];
  /** список вложенных элементов */
  elements: PriceElement[];

  clone(): PriceElement;
  /**
   * Создать новый элемент сметы внутри
   */
  newElement(name?: string, sku?: string, price?: number): PriceElement;
}

interface PriceList {
  id: number;
  name: string;
  items: { [sku: string]: number };
}

/** Смета проекта */
declare var estimate: {
  /** Список элементов модели */
  models: PriceElement[];
  /** Текущий прайс-лист */
  priceList: PriceList;

  /**
   * Функция для изменения параметров элементов при добавлении их в смету.
   * Если функция не возвращает результат, то элемент не будет входить в смету
   */
  alterPriceElement: (element: PriceElement, entity?: Entity) => PriceElement;

  /** Функция для изменения параметров элементов. Вызывается после расчета сметы
   * Может исполнять асинхронные запросы, для этого функция должна вернуть Promise
   */
  alterEstimate: (models: PriceElement[]) => Promise<PriceElement[]> | PriceElement[] | undefined;

  /** Получить названия и значения визуальных свойств установленных в элементе */
  getElementPropertyDescription(e: PriceElement): string;
}

declare var http: {
  get(url: string): Promise<any>;
  /**
   * Отправка POST запроса
   * @param url адрес отправки, для отправки запроса через сервер минуя CORS
   * нужно указать протокол proxy:// в качестве префикса и указать абсолютный адрес после него
   * @param data данные для отправки
   */
  post(url: string, data: any): Promise<any>;
  delete(url: string): Promise<any>;
}

interface UIItem {
  text: string;
  icon: string;
  tooltip: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled: boolean;
  class: string;
  click: () => void;
}

interface UICollection {
  items: UIItem[];
  add(text: string): UIItem;
  addIcon(icon: string): UIItem;
  remove(item: UIItem);
}

interface PlannerUI {
  toolbar: UICollection;
  menu: UICollection;
  popup: UICollection;

  /** Показать всплывающее окно */
  alert(message: string);
  /** Показать всплывающее внизу сообщение окно
   * @param message Текст сообщения
   * @param duration Длительность показа в секундах. По умолчанию - 3
   */
  snack(message: string, duration?: number);

  /**
   * Создать новую SVG иконку для использования в меню и на панелях инструментов
   * @param svg XML код иконки
   */
  addSvgIcon(svg: string): string;
  addSvgIcon(name: string, svg: string);
  addSvgIconSet(url: string);
}

interface Box {
  sizex: number;
  sizey: number;
  sizez: number;
}

interface Entity {
  name: string;
  type: string;
  uidStr: string;
  sizeBox: Box;
  selected: boolean;
  visible: boolean;
  matrix: Float64Array;
  children: Entity[];
}

interface ModelInfo {
  id?: string;
  sku?: string;
}

interface ProjectEditor {
  insert(id: number): Promise<Entity>;
  remove(e: Entity): Promise<void>;
  getModelInfo(e: Entity): ModelInfo | undefined;
}

/** Интерфейс планировщика */
declare var planner: {
  root?: Entity;
  selected?: Entity;
  selectedItems: Entity[];

  /** Флаг встроенного режима планировщика внутри сайта */
  embedded: boolean;

  findAll(filter: (e: any) => boolean): Entity[];

  ui: PlannerUI;
  editor: ProjectEditor;

  onLoad?: () => void;
  onSelect?: (status: any) => void;
}
