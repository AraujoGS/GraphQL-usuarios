const bcrypt = require("bcrypt-nodejs");
const { getUsuarioLogado } = require("../Common/usuario");

module.exports = {
  async login(_, { dados }, context) {
    const usuario = await context
      .db("usuarios")
      .where({ email: dados.email })
      .first();

    if (!usuario) {
      throw new Error("E-mail incorreto.");
    }

    const senhaValida = bcrypt.compareSync(dados.senha, usuario.senha);

    if (!senhaValida) {
      throw new Error("Senha incorreta.");
    }

    return getUsuarioLogado(usuario);
  },
  usuarios(_, args, context) {
    if (context && context.validarAdmin) {
      context.validarAdmin();
    }
    return context.db("usuarios");
  },
  usuario(_, { filtro }, context) {
    if (context && context.validarUsuarioFiltro) {
      context.validarUsuarioFiltro(filtro);
    }

    if (!filtro) return null;
    const { id, email } = filtro;
    if (id) {
      return context.db("usuarios").where({ id }).first();
    } else if (email) {
      return context.db("usuarios").where({ email }).first();
    } else {
      return null;
    }
  },
};
