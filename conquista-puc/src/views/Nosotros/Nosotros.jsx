import './Nosotros.css';

function Nosotros() {
  const teamMembers = [
    {
      id: 1,
      name: "Agustín Saavedra",
      role: "Desarrollador",
      image: "/images/team/agustin.jpg",
      description: "Pasión por la programación y el diseño de juegos",
    },
    {
      id: 2,
      name: "Raimundo Santuber", 
      role: "Desarrollador",
      image: "/images/team/raimundo.jpg",
      description: "Aficionado a la inteligencia artificial y la creación de mundos virtuales"
    },
    {
      id: 3,
      name: "Nicolás Llanos",
      role: "Desarrollador",
      image: "/images/team/nicolas.jpg", 
      description: "Reconocido por su habilidad en programación de juegos y lógica"
    }
  ];

  return (
    <div className="nosotros">
      <div className="pergamino">
        <h1 className="titulo">Sobre Nosotros</h1>
        
        <div className="historia-section">
          <h2 className="subtitulo">Nuestra Historia</h2>
          <p className="descripcion">
            Somos un equipo de estudiantes apasionados por el desarrollo de videojuegos y la tecnología.
            Conquista la PUC nació como un proyecto universitario para el curso IIC2513 con el objetivo de crear una experiencia
            de juego única que combine estrategia, diversión y el orgullo por nuestra universidad.
          </p>
        </div>

        <div className="equipo-section">
          <h2 className="subtitulo">Nuestro Equipo</h2>
          <div className="team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="team-member">
                <div className="member-image-container">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="member-image"
                    onError={(e) => {
                      e.target.src = '/images/team/default-avatar.jpg';
                    }}
                  />
                </div>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="vision-section">
          <h2 className="subtitulo">Nuestra Visión</h2>
          <p className="descripcion">
            Crear experiencias de juego que unan a la comunidad universitaria y fomenten
            el pensamiento estratégico, mientras celebramos la rica historia y cultura
            de la Universidad Católica.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Nosotros;
