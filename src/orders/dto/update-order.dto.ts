export class UpdateOrderDto {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  qPay_shortUrl: string;
  urls: url[];
}

type url = {
  name: string;
  description: string;
  logo: string;
  link: string;
};
