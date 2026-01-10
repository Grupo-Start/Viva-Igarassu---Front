import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/button/Button';
import './passwordlogged.css';
import Img from '../../../assets/Logoimg.jpeg';
import { FaLock } from 'react-icons/fa';
import { authService } from '../../../services/api';

export function AlterarSenha() {
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!senhaAtual || !novaSenha || !confirmaSenha) {
      setErro('Preencha todos os campos');
      return;
    }

    if (novaSenha !== confirmaSenha) {
      setErro('As senhas não correspondem');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(senhaAtual, novaSenha);
      alert('Senha alterada com sucesso!');
      navigate('/empresa-dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao alterar senha. Verifique a senha atual.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-alterarsenha">
      <div className="container-imagem-alterarsenha">
        <img className="img-alterarsenha" src={Img} alt="Viva Igarassu" />
      </div>

      <div className="form-alterarsenha">
        <h2 className="text-global">Alterar Senha</h2>
        <p className="subtitle-p">Preencha os campos abaixo</p>

        {erro && <div className="mensagem-erro-alterarsenha">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-alterarsenha-container">
            <input
              className="alterarsenha-input"
              type="password"
              placeholder="Senha atual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
            <FaLock className="img-cadeado" />
          </div>

          <div className="form-alterarsenha-container">
            <input
              className="alterarsenha-input"
              type="password"
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
            <FaLock className="img-cadeado" />
          </div>

          <div className="form-alterarsenha-container">
            <input
              className="alterarsenha-input"
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
            />
            <FaLock className="img-cadeado" />
          </div>

          <Button 
            text={loading ? 'Alterando...' : 'Alterar Senha'} 
            disabled={loading} 
            type="submit" 
          />
        </form>

        <button
          type="button"
          className="underline-alterarsenha"
          onClick={() => navigate('/empresa-dashboard')}
          disabled={loading}
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
}
