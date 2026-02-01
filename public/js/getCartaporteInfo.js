import customers from "../utils/customers.json" with { type: "json" };
import origins from "../utils/origin-places.json" with { type: "json" };
import destinations from "../utils/destination-places.json" with { type: "json" };
import clientAlias from "../utils/customer-alias.json" with { type: "json" };

export class GetCartaporteInfo {
  constructor() {
    this.customers = customers;
    this.origins = origins;
    this.destinations = destinations;
    this.clientAlias = clientAlias;
  }

  // ======================
  // Helpers
  // ======================

  normalize(str) {
    return String(str || "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  words(str) {
    return this.normalize(str).split(/\s+/);
  }

  // ======================
  // CLIENTE
  // ======================

  clientData(companyKey) {
    if (!companyKey) return null;

    const aliasKey = this.normalize(companyKey);
    const legalName = this.clientAlias[aliasKey];
    if (!legalName) return null;

    return (
      this.customers.find(
        (c) => this.normalize(c.cliente) === this.normalize(legalName),
      ) || null
    );
  }

  // ======================
  // ORIGEN
  // ======================

  originData(lugar) {
    const key = this.normalize(lugar);

    return this.origins.find((o) => this.normalize(o.company) === key) || null;
  }

  // ======================
  // DESTINO
  // ======================

  destinationData(destino) {
    const searchWords = this.words(destino);

    return (
      this.destinations.find((d) => {
        const companyWords = this.words(d.company);
        return searchWords.some((w) => companyWords.includes(w));
      }) || null
    );
  }
}
