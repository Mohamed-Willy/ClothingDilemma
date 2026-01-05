namespace M_Player
{
    public interface IState
    {
        public string StateName { get; }

        public void Begin();

        public void Update();

        public void End();
    }
}