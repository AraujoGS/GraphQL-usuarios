const db = require("./db");
const { getUsuarioLogado } = require("../resolvers/Common/usuario");

const sql = `
    select 
        u.*
    from
        usuarios u,
        usuarios_perfis up,
        perfis p
    where
        u.id = up.usuario_id and 
        p.id = up.perfil_id and 
        u.ativo = 1 and 
        p.nome = :nomePerfil
    limit 1    
`;

const getUsuario = async (nomePerfil) => {
  const res = await db.raw(sql, { nomePerfil });
  return res ? res[0][0] : null;
};

module.exports = async (req) => {
  const usuario = await getUsuario("admin");
  if (usuario) {
    const { token } = await getUsuarioLogado(usuario);

    req.headers = {
      authorization: `Bearer ${token}`,
    };
  }
};
