import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { UnidadeAcademicaService } from 'src/app/services/unidade-academica.service';
import { DisciplinaService } from 'src/app/services/disciplina.service';
import { UnidadeAcademica } from 'src/app/interfaces/unidade-academica';
import { Disciplina } from 'src/app/interfaces/disciplina';
import { InteresseService } from 'src/app/services/interesse.service';
import { Interesse } from 'src/app/interfaces/interesse';
import { Usuario } from 'src/app/interfaces/usuario';
import { Semestre } from 'src/app/interfaces/semestre';
import { SemestreService } from 'src/app/services/semestre.service';
import { UsuarioService } from 'src/app/services/usuario.service';

declare var $;

@Component({
  selector: 'pj-disciplinas-interesse',
  templateUrl: './disciplinas-interesse.component.html',
  styleUrls: ['./disciplinas-interesse.component.css']
})
export class DisciplinasInteresseComponent implements OnInit {

  mensagem: string;
  DisciplinasDeinteresseForm: FormGroup;
  usuario: Usuario;
  semestre: Semestre;
  unidadesAcademicas: UnidadeAcademica[];
  dropdownSettings = {};
  unidadesSelecionadas = [];

  constructor(
    private formBuilder: FormBuilder,
    private unidadeAcademicaService: UnidadeAcademicaService,
    private disciplinaService: DisciplinaService,
    private interesseService: InteresseService,
    private semestreService: SemestreService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.carregarUnidadesAcademicas();
    this.carregarInformacoesUsuario();
    this.usuario = JSON.parse(sessionStorage.getItem('usuario'));
    // console.log(this.usuario);
    this.semestreService.getAll().subscribe(data => {
      if (data) {
        this.semestre = data[0];
      }
    });
    this.DisciplinasDeinteresseForm = this.formBuilder.group({
      // MULTI-SELECTS
      unidadeAcademicaDisciplina1: [null],
      unidadeAcademicaDisciplina2: [null],
      unidadeAcademicaDisciplina3: [null],
      unidadeAcademicaDisciplina4: [null],
      unidadeAcademicaDisciplina5: [null],
      unidadeAcademicaDisciplina6: [null],
      unidadeAcademicaDisciplina7: [null],
      unidadeAcademicaDisciplina8: [null],
      unidadeAcademicaDisciplina9: [null],
      unidadeAcademicaDisciplina10: [null],

      // DISCIPLINAS
      inputNomeDisciplina1: null,
      inputNomeDisciplina2: null,
      inputNomeDisciplina3: null,
      inputNomeDisciplina4: null,
      inputNomeDisciplina5: null,
      inputNomeDisciplina6: null,
      inputNomeDisciplina7: null,
      inputNomeDisciplina8: null,
      inputNomeDisciplina9: null,
      inputNomeDisciplina10: null,
    });

    // PARÂMETROS DO COMPONENTE MULTI-SELECT
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'nome',
      selectAllText: 'Selecionar todos',
      unSelectAllText: 'Desmarcar todos',
      itemsShowLimit: 5,
      allowSearchFilter: false
    };
  }

  // CARREGA AS UNIDADES ACADÊMICAS
  carregarInformacoesUsuario() {
    this.usuarioService.getOne(JSON.parse(sessionStorage.getItem('usuario')).id).subscribe(data => {
      if (data) {
        this.usuario = data;
        this.preencherFormulario();
      }
    });
  }

  carregarUnidadesAcademicas() {
    this.unidadeAcademicaService.getAll().subscribe(data => {
      if (data) {
        this.unidadesAcademicas = data;
      }
    });
  }

  // ADICIONA OS VALORES DOS INPUTS TEXT
  addFormControl(name: string, formControl: FormControl) {
    this.DisciplinasDeinteresseForm.addControl(name, formControl);
  }

  // SALVAR AS INFORMAÇÕES
  salvar() {
    if (this.usuario.disciplinasDeInteresse.length <= 0) {
      for (let i = 1; i <= 10; i++) {
        if (this.DisciplinasDeinteresseForm.get(`inputNomeDisciplina${i}`)
          && this.DisciplinasDeinteresseForm.get(`unidadeAcademicaDisciplina${i}`)
          && this.DisciplinasDeinteresseForm.get(`inputNomeDisciplina${i}`).value
          && this.DisciplinasDeinteresseForm.get(`unidadeAcademicaDisciplina${i}`).value) {
          this.disciplinaService.save(this.criarObjetoDisciplina(i)).subscribe(data => {
            // CADASTROU A DISCIPLINA
            if (data) {
              this.interesseService.save(this.criarObjetoInteresse(data, this.getUnidadesAcademicasSelecionadas(i), i)).subscribe(dataI => {
                $('html, body').animate({ scrollTop: 0 }, 'slow');
                this.mensagem = 'Disciplinas de interesse cadastradas com sucesso!';
                setTimeout(() => {
                  this.mensagem = null;
                }, 5000);
              });
            }
          });
        }
      }
    } else {
      this.atualizarQuadroInteresse();
    }
  }

  // ATUALIZAR AS INFORMAÇÕES
  atualizarQuadroInteresse() {
    this.usuario.disciplinasDeInteresse.forEach(value => {
      this.interesseService.delete(value.id).subscribe(data => {
        // console.log(data);
      });
    });
    for (let i = 1; i <= 10; i++) {
      if (this.DisciplinasDeinteresseForm.get(`inputNomeDisciplina${i}`)
        && this.DisciplinasDeinteresseForm.get(`unidadeAcademicaDisciplina${i}`)
        && this.DisciplinasDeinteresseForm.get(`inputNomeDisciplina${i}`).value
        && this.DisciplinasDeinteresseForm.get(`unidadeAcademicaDisciplina${i}`).value) {
        this.disciplinaService.save(this.criarObjetoDisciplina(i)).subscribe(data => {
          // CADASTROU A DISCIPLINA
          if (data) {
            this.interesseService.save(this.criarObjetoInteresse(data, this.getUnidadesAcademicasSelecionadas(i), i)).subscribe(dataI => {
              $('html, body').animate({ scrollTop: 0 }, 'slow');
              this.mensagem = 'Disciplinas de interesse atualizadas com sucesso!';
              setTimeout(() => {
                this.mensagem = null;
              }, 5000);
            });
          }
        });
      }
    }
  }

  // CRIA O OBJETO DE DISCIPLINAS DE INTERESSE
  criarObjetoDisciplina(numeroDisciplina): Disciplina {
    const disciplina: Disciplina = {
      id: null,
      descricao: this.DisciplinasDeinteresseForm.get(`inputNomeDisciplina${numeroDisciplina}`).value,
      dataHoraCadastro: null,
      dataHoraAlteracao: null,
      dataHoraExclusao: null
    };
    return disciplina;
  }

  // CRIA O OBJETO INTERESSE
  criarObjetoInteresse(disciplina: Disciplina, unidadesAcademicas: UnidadeAcademica[], numeroPrioridade: number): Interesse {
    const interesse: Interesse = {
      id: null,
      disciplina: disciplina,
      professor: this.usuario,
      prioridade: numeroPrioridade,
      semestre: this.semestre,
      unidadesAcademicas: unidadesAcademicas,
      dataHoraCadastro: null,
      dataHoraAlteracao: null,
      dataHoraExclusao: null
    };
    return interesse;
  }

  // PREENCHER AS INFORMAÇÕES NA TELA
  preencherFormulario() {
    this.usuario.disciplinasDeInteresse.forEach((data) => {
      const lista = new Array<any>();
      data.unidadesAcademicas.forEach(unidade => {
        lista.push({
          id: unidade['id'],
          nome: unidade['nome']
        });
      });
      this.unidadesSelecionadas[`unidadeAcademicaDisciplina${data.prioridade}`] = lista;
      this.DisciplinasDeinteresseForm.get(`unidadeAcademicaDisciplina${data.prioridade}`).setValue(lista);
      this.DisciplinasDeinteresseForm.get(`inputNomeDisciplina${data.prioridade}`).setValue(data.disciplina.descricao);
    });
  }

  // PEGAR AS UNIDADES SELECIONADAS
  getUnidadesAcademicasSelecionadas(numeroCampo): UnidadeAcademica[] {
    const unidadesSelecionadas = new Array<UnidadeAcademica>();
    const unidadesString = this.DisciplinasDeinteresseForm.get(`unidadeAcademicaDisciplina${numeroCampo}`).value;
    unidadesString.forEach((value) => {
      unidadesSelecionadas.push({
        id: value['id'],
        nome: null,
        sigla: null,
        dataHoraCadastro: null,
        dataHoraAlteracao: null,
        dataHoraExclusao: null
      });
    });
    return unidadesSelecionadas;
  }
}
