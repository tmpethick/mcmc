module Thesis.Model where
import Control.Monad
import Control.Monad.Free
import Control.Monad.State
import System.Random (mkStdGen, randomR)
import qualified Thesis.Random as R

data ModelF r =
    BernoulliF Double (Bool -> r)
  | UniformF Double Double (Double -> r)

instance Functor ModelF where
  fmap f (BernoulliF a k) = BernoulliF a (f . k)
  fmap f (UniformF a b k) = UniformF a b (f . k)

type Model = Free ModelF

uniform :: Double -> Double -> Model Double
uniform a b = liftF (UniformF a b id)

bernoulli :: Double -> Model Bool
bernoulli p = liftF (BernoulliF p id)

sample f g = runState f g

interpret (Pure x) s = (x, s)
interpret (Free m) s = case m of 
  (BernoulliF p f) -> interpret (f m') s'
                      where (m', s') = sample (R.bernoulli p) s
  (UniformF a b f) -> let (m', s') = sample (R.uniform a b) s 
                      in interpret (f m') s'

-- Example
dist = do
  a <- uniform 0 2
  a' <- uniform 0 2
  b <- bernoulli 0.2
  if b then return a else return a' 


geo p = do
    a <- bernoulli p
    if a then return 1 
    else do
      g <- geo p
      return (g + 1)

distResult = interpret dist (mkStdGen 1)
geoResult  = interpret (geo 0.1) (mkStdGen 1)
