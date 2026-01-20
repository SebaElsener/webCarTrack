const cards = [
  {
    title: "Usuarios",
    description: "Portal administrativo - Gestión de usuarios",
    icon: "/icons/user - 01.png",
    href: "/api/userdata/usersadmin",
    adminOnly: true,
  },
  {
    title: "Vehículos",
    description: "Registro y consulta por VIN",
    icon: "/icons/car1.png",
    href: "/api/querys/queryByVIN",
  },
  {
    title: "Consultas",
    description: "Reporte por fecha, marca y modelo - Areas y tipo de daño",
    icon: "/icons/search.png",
    href: "/api/querys/queryByDate",
  },
  {
    title: "Reportes",
    description: "Historial e inspecciones",
    icon: "/icons/stats - 01.png",
    href: "/api/querys/queryByDate",
  },
];

function Home({ user, admin }) {
  return (
    <div className="home-container">
      <section className="cards-grid">
        {cards
          .filter((card) => !card.adminOnly || admin === "true")
          .map((card) => (
            <a
              href={card.href}
              style={{ textDecoration: "none", color: "#6b7280" }}
            >
              <div
                className="homeCard"
                key={card.title}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={card.icon}
                  alt={card.title}
                  className="card-icon"
                  draggable="false"
                />
                <h3 className="cardTitle">{card.title}</h3>
                <p className="pCard">{card.description}</p>
              </div>
            </a>
          ))}
      </section>
    </div>
  );
}
