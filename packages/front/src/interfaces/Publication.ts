import { Publication } from "pre-processor";

interface PublicationsPage {
  total: number;
  pageCount: number | null;
  data: Array<Publication>;
}

export default Publication;
export { PublicationsPage };
