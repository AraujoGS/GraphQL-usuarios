const { perfil: obterPerfil } = require("../Query/perfil");

module.exports = {
  async novoPerfil(_, { dados }, context) {
    if (context && context.validarAdmin) {
      context.validarAdmin();
    }

    try {
      const [id] = await context.db("perfis").insert(dados);
      return context.db("perfis").where({ id }).first();
    } catch (e) {
      throw new Error(e.sqlMessage);
    }
  },
  async excluirPerfil(_, args, context) {
    if (context && context.validarAdmin) {
      context.validarAdmin();
    }

    try {
      const perfil = await obterPerfil(_, args, { db: context.db });
      if (perfil) {
        const { id } = perfil;
        await context.db("usuarios_perfis").where({ perfil_id: id }).delete();
        await context.db("perfis").where({ id }).delete();
      }
      return perfil;
    } catch (e) {
      throw new Error(e.sqlMessage);
    }
  },
  async alterarPerfil(_, { filtro, dados }, context) {
    if (context && context.validarAdmin) {
      context.validarAdmin();
    }

    try {
      const perfil = await obterPerfil(_, { filtro }, { db: context.db });
      if (perfil) {
        const { id } = perfil;
        await context.db("perfis").where({ id }).update(dados);
      }
      return { ...perfil, ...dados };
    } catch (e) {
      throw new Error(e.sqlMessage);
    }
  },
};
