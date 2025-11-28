require "nvchad.mappings"

-- add yours here

local map = vim.keymap.set

map("n", ";", ":", { desc = "CMD enter command mode" })
map("i", "jk", "<ESC>")

map("n", "<C-j>", ":m+1<CR>", { desc = "Mover linea abajo"})
map("n", "<C-k>", ":m-2<CR>", { desc = "Mover linea arriba"})
-- map({ "n", "i", "v" }, "<C-s>", "<cmd> w <cr>")

map("v", "<C-j>", ":m'>+1<CR>gv=gv", { desc = "Mover seleccion abajo"})
map("v", "<C-k>", ":m'<-2<CR>gv=gv", { desc = "Mover seleccion arriba"})

