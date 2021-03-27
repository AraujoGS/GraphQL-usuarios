module.exports = {
  perfis(_, args, context) {
    if (context && context.validarAdmin) {
      context.validarAdmin();
    }
    return context.db("perfis");
  },
  perfil(_, { filtro }, context) {
    if (context && context.validarAdmin) {
      context.validarAdmin();
    }
    if (!filtro) return null;
    const { id, nome } = filtro;
    if (id) {
      return context.db("perfis").where({ id }).first();
    } else if (nome) {
      return context.db("perfis").where({ nome }).first();
    } else {
      return null;
    }
  },
};
