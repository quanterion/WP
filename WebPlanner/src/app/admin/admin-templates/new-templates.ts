export const printTemplate =
`<page>
    <table border="1">
        <thead>
            <tr>
                <th>Артикул</th>
                <th>Наименование</th>
                <th>Ед.изм</th>
                <th>Кол-во</th>
                <th>Сумма</th>
                <th>Примечание</th>
            </tr>
        </thead>
        <tbody>
            <tr *ngFor="let item of specification">
                <td class="center">{{item.sku}}</td>
                <td>
                    <span *ngIf="item.index" class="push-right push-left">{{item.index}}.</span>
                    <span>{{item.name}}</span>
                    <div *ngIf="item.description" class="push-left description">{{item.description}}</div>
                </td>
                <td class="center">шт</td>
                <td class="center">{{item.count}}</td>
                <td class="center">{{item.count * item.price}}</td>
                <td></td>
            </tr>
        </tbody>
    </table>
    <div class="total">Итого: {{totalPrice}},00</div>
    <section class="sign">
        <span>Продавец</span>
        <div class="sign"></div>
        <span class="push-left">Заказчик</span>
        <div class="sign"></div>
    </section>
</page>

<page>
    <img [src]="renderImage()" class="picture">
<page>

<page>
    <img [src]="renderImage({mode: 'HiddenEdgesRemoved', view: [20, -20]})" class="picture">
<page>
`;

export const printStyle =
`img.picture {
    width: 100%;
    max-height: 70vh;
}

img.logo {
    width: auto;
    object-fit: contain;
}

table {
    width: 100%;
    border: 1px solid;
    border-collapse: collapse;
}

td, th {
    border: 1px solid
}

tbody td {
    font-weight: normal;
}

h2 {
    font-size: 5mm;
}

h3 {
    font-size: 4mm;
}

div.header {
    position: relative;
    display: flex;
    flex-direction: row;
}

div.header section {
    padding-left: 5mm;
}

span.half {
    width: 50%;
}

section.sign {
    margin: auto;
    padding-top: 1cm;
    font-size: 4mm;
}

div.sign {
    display: inline-block;
    width: 5cm;
    border-bottom: 1px solid black;
    margin-left: 8px;
    margin-right: 8px;
}

.description {
    font-size: 4mm;
}

td.center {
    text-align: center;
}

.push-left {
    margin-left: 8px;
}

.push-right {
    margin-right: 8px;
}

div.total {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: 5mm;
    font-weight: bold;
    text-align: right;
}
`;

export const emailTemplate =
`<p>Добрый день! Проект {{project.name}} доступен по ссылке <a [href]="currentUrl">3D проект вашего заказа</a></p>
<ng-container *ngIf="user">
  <p>-----------------------------</p>
  <p>Ваш менеджер: {{user.fullName || user.name}}</p>
  <p>Телефон: {{user.phone}}</p>
  <p>Адрес салона: {{user.address}}</p>
</ng-container>
`;

export const xmlTemplate =
`<Document>
    <ZakazInfo>
        <Url>{{project.url}}</Url>
        <ng-container _ngIf="order.client">
            <ClientName>{{order.client.name}}</ClientName>
            <E-mail>{{order.client.email}}</E-mail>
            <Phone>{{order.client.phone}}</Phone>
            <Address>{{order.client.address}}</Address>
        </ng-container>
        <ProductData _ngFor="let model of estimate.models">
            <Name>{{model.name}}</Name>
            <Article>{{model.sku}}</Article>
            <Price>{{model.price}}</Price>
            <PriceNotDiscount>{{model.price}}</PriceNotDiscount>
            <Discount>0</Discount>
            <Quantity>{{model.count}}</Quantity>

            <Elements _ngIf="model.elements && model.elements.length">
                <ProductData _ngFor="let elem of model.elements">
                    <Name>{{elem.name}}</Name>
                    <Article>{{elem.sku}}</Article>
                    <Price>{{elem.price}}</Price>
                    <PriceNotDiscount>{{elem.price}}</PriceNotDiscount>
                    <Discount>0</Discount>
                    <Quantity>{{elem.count}}</Quantity>
                </ProductData>
            </Elements>
        </ProductData>
    </ZakazInfo>
</Document>
`;
