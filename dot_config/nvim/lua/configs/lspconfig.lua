-- load defaults i.e lua_lsp
require("nvchad.configs.lspconfig").defaults()

-- Añade aquí los nombres de los servidores
local servers = {
  "html",
  "cssls",
  "lua_ls",

  -- Añadir los nombres de configuración de lspconfig aquí
  "pyright",
  "clangd",
  "bashls",
  "marksman",
  "eslint_d",
  "biome",
  "deno"
}
local nvlsp = require "nvchad.configs.lspconfig"

for _, lsp in ipairs(servers) do
  vim.lsp.config(lsp, {
    on_attach = nvlsp.on_attach,
    on_init = nvlsp.on_init,
    capabilities = nvlsp.capabilities,
  })
end
