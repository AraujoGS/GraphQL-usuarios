const bcrypt = require("bcrypt-nodejs");
const { perfil: obterPerfil } = require("../Query/perfil");
const { usuario: obterUsuario } = require("../Query/usuario");

const migrations = {
  registrarUsuario(_, { dados }, context) {
    try {
      return migrations.novoUsuario(_, { dados }, { db: context.db });
    } catch (error) {
      throw new Error(e.sqlMessage);
    }
  },
  async novoUsuario(_, { dados }, context) {
    if (context && context.validarAdmin) {
      context.validarAdmin();
    }

    try {
      const idsPerfis = [];

      if (!dados.perfis || !dados.perfis.length) {
        dados.perfis = [
          {
            nome: "comum",
          },
        ];
      }

      for (let filtro of dados.perfis) {
        const perfil = await obterPerfil(
          _,
          {
            filtro,
          },
          { db: context.db }
        );
        if (perfil) idsPerfis.push(perfil.id);
      }

      delete dados.perfis;

      const salt = bcrypt.genSaltSync();
      dados.senha = bcrypt.hashSync(dados.senha, salt);

      const [id] = await context.db("usuarios").insert(dados);

      for (let perfil_id of idsPerfis) {
        await context
          .db("usuarios_perfis")
          .insert({ perfil_id, usuario_id: id });
      }

      return context.db("usuarios").where({ id }).first();
    } catch (e) {
      throw new Error(e.sqlMessage);
    }
  },
  async excluirUsuario(_, args, context) {
    if (context && context.validarAdmin) {
      context.validarAdmin();
    }

    try {
      const usuario = await obterUsuario(_, args, { db: context.db });
      if (usuario) {
        const { id } = usuario;
        await context.db("usuarios_perfis").where({ usuario_id: id }).delete();
        await context.db("usuarios").where({ id }).delete();
      }
      return usuario;
    } catch (e) {
      throw new Error(e.sqlMessage);
    }
  },
  async alterarUsuario(_, { filtro, dados }, context) {
    if (context && context.validarUsuarioFiltro) {
      context.validarUsuarioFiltro(filtro);
    }

    try {
      const usuario = await obterUsuario(_, { filtro }, { db: context.db });
      if (usuario) {
        const { id } = usuario;
        if (context.admin && dados.perfis) {
          await context
            .db("usuarios_perfis")
            .where({ usuario_id: id })
            .delete();

          for (let filtro of dados.perfis) {
            const perfil = await obterPerfil(
              _,
              {
                filtro,
              },
              { db: context.db }
            );

            if (perfil) {
              await context.db("usuarios_perfis").insert({
                perfil_id: perfil.id,
                usuario_id: id,
              });
            }
          }
        }

        delete dados.perfis;

        const salt = bcrypt.genSaltSync();
        dados.senha = bcrypt.hashSync(dados.senha, salt);

        await context.db("usuarios").where({ id }).update(dados);
      }
      return !usuario ? null : { ...usuario, ...dados };
    } catch (e) {
      throw new Error(e);
    }
  },
};

module.exports = migrations;
