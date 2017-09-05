module Thesis.FreeState where

-- Based on work from http://okmij.org/ftp/Computation/FreeState.hs

-- State with only functor definition
newtype State s a = State{runState :: s -> (a,s)}

instance Functor (State s) where
  fmap f (State g) = State (\st -> let (x, st') = g st 
                                   in (f x, st'))

get :: State s s
get = State $ \s -> (s,s)

put :: s -> State s ()
put s = State $ \_ -> ((),s)

-- Free monad
data Free f r = Impure (f (Free f r)) | Pure r

instance Functor f => Functor (Free f) where
  fmap f (Pure x)   = Pure $ f x
  fmap f (Impure m) = Impure $ fmap (fmap f) m

-- Applicatives has not been covered but every monad is also an Applicative.
instance Functor f => Applicative (Free f) where
  pure = Pure
  Pure f <*> m   = fmap f m
  Impure f <*> m = Impure $ fmap (<*> m) f

instance Functor f => Monad (Free f) where
  return = Pure
  Pure a   >>= k = k a
  Impure m >>= k = Impure (fmap (>>= k) m)

liftF :: Functor f => f a -> Free f a
liftF = Impure . fmap Pure

-- Free State monad
type FState s = Free (State s)

getF :: FState s s
getF = liftF get

putF :: s -> FState s ()
putF = liftF . put

-- Interpreter
runFState :: FState s a -> s -> (a,s)
runFState (Pure x) s   = (x,s)
runFState (Impure m) s = let (m',s') = runState m s in runFState m' s'

test :: FState Int Int
test = do 
  x <- getF
  putF 12
  return x

result = (10, 12) == runFState test 10