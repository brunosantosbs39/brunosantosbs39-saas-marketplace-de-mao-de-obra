import { test } from "node:test";
import assert from "node:assert/strict";
import { podeMudarOrdem } from "../src/lib/regras-servico.ts";

test("serviço confirmado pode iniciar ou cancelar, mas não pular execução", () => {
  for (const contractor of [true, false]) {
    assert.equal(podeMudarOrdem("confirmado", "em_andamento", contractor), true);
    assert.equal(podeMudarOrdem("confirmado", "cancelado", contractor), true);
    assert.equal(podeMudarOrdem("confirmado", "concluido", contractor), false);
  }
});
test("somente contratante conclui o serviço em andamento", () => {
  assert.equal(podeMudarOrdem("em_andamento", "concluido", true), true);
  assert.equal(podeMudarOrdem("em_andamento", "concluido", false), false);
});
test("estados finais não podem reabrir nem concluir novamente", () => {
  for (const current of ["concluido", "cancelado"]) {
    for (const next of ["em_andamento", "cancelado", "concluido", "confirmado"]) {
      for (const contractor of [true, false]) assert.equal(podeMudarOrdem(current, next, contractor), false);
    }
  }
});
test("estados desconhecidos e transições repetidas são recusados", () => {
  assert.equal(podeMudarOrdem("desconhecido", "concluido", true), false);
  assert.equal(podeMudarOrdem("em_andamento", "em_andamento", true), false);
  assert.equal(podeMudarOrdem("confirmado", "desconhecido", true), false);
});
