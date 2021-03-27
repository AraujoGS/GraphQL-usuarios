const jwt = require("jwt-simple");
const db = require("./db");

//não é feito nenhum lançamento de exceção aqui, se prepara os dados que desejo colocar no contexto
module.exports = async ({ req }) => {
  //await require("./simularLoginUsuario")(req);

  const auth = req.headers.authorization;

  const token = auth && auth.substring(7); //pego todo conteúdo após 'Bearer '

  let usuario = null;
  let admin = null;
  const erro = new Error("Acesso Negado!");

  if (token) {
    try {
      const conteudoToken = jwt.decode(token, process.env.APP_AUTH_SECRET);
      //a propriedade 'exp' está em s, preciso colocar em ms
      if (new Date(conteudoToken.exp * 1000) > new Date()) {
        usuario = conteudoToken;
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (usuario && usuario.perfis) {
    admin = usuario.perfis.includes("admin");
  }

  return {
    usuario,
    admin,
    db,
    validarUsuario() {
      if (!usuario) throw erro;
    },
    validarAdmin() {
      if (!admin) throw erro;
    },
    validarUsuarioFiltro(filtro) {
      if (admin) return;

      if (!usuario) throw erro;
      if (!filtro) throw erro;

      const { id, email } = filtro;
      if (!id && !email) throw erro;
      if (id && id !== usuario.id) throw erro;
      if (email && email !== usuario.email) throw erro;
    },
  };
};
